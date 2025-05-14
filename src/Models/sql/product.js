const { ADMINPool } = require('./config')

class ProductModel {
  static async getAll({ id, sku, name, all }) {
    try {
      if (sku) {
        const querySku = `SELECT 
                              p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.status, p.adminStatus, 
                              p.specifications, p.descriptions, p.total_views, p.week_views, p.tax_percentage,
                              GROUP_CONCAT(DISTINCT pi.img_url) AS img_urls,
                              GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                            FROM products p
                            LEFT JOIN products_images pi ON p.sku = pi.sku  -- Join por sku
                            LEFT JOIN products_prices pp ON p.sku = pp.sku  -- Join por sku
                            WHERE p.sku = ? 
                            GROUP BY p.id`;

        const [results] = await ADMINPool.query(querySku, [sku]);

        results.forEach(result => {
          result.prices = result.prices ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':');
            const parsedValue = parseFloat(value);
            if (parsedValue >= 1000) {
              acc[key] = parsedValue;
            }
            return acc;
          }, {}) : {};

          result.img_urls = result.img_urls
            ? result.img_urls
                .split(',')
                .sort((a, b) => {
                  const matchA = a.match(/_(\d+)\./);
                  const numA = parseInt(matchA ? matchA[1] : '0', 10);

                  const matchB = b.match(/_(\d+)\./);
                  const numB = parseInt(matchB ? matchB[1] : '0', 10);

                  return numA - numB;
                })
            : [];

          for (let priceKey in result.prices) {
            result[priceKey] = result.prices[priceKey];
          }

          delete result.prices;
        });

        return results; // Devolver los productos con sku
      }

      if (all) {
        const queryAll = `SELECT 
                              p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.status, p.adminStatus, 
                              p.specifications, p.descriptions, p.total_views, p.week_views, p.tax_percentage,
                              GROUP_CONCAT(DISTINCT pi.img_url) AS img_urls,
                              GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                            FROM products p
                            LEFT JOIN products_images pi ON p.sku = pi.sku  -- Join por sku
                            LEFT JOIN products_prices pp ON p.sku = pp.sku  -- Join por sku
                            GROUP BY p.id`;

        const [results] = await ADMINPool.query(queryAll);

        results.forEach(result => {
          result.prices = result.prices ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':');
            const parsedValue = parseFloat(value);
            if (parsedValue >= 1000) {
              acc[key] = parsedValue;
            }
            return acc;
          }, {}) : {};
          result.img_urls = result.img_urls
            ? result.img_urls
                .split(',')
                .sort((a, b) => {
                  const matchA = a.match(/_(\d+)\./);
                  const numA = parseInt(matchA ? matchA[1] : '0', 10);

                  const matchB = b.match(/_(\d+)\./);
                  const numB = parseInt(matchB ? matchB[1] : '0', 10);

                  return numA - numB;
                })
            : [];

          for (let priceKey in result.prices) {
            result[priceKey] = result.prices[priceKey];
          }

          delete result.prices;
        });

        return results; // Devolver todos los productos
      }

      let query = `SELECT 
                      p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.week_views, p.total_views, p.brand, p.status, p.adminStatus, p.tax_percentage,
                      SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT pi.img_url ORDER BY pi.id), ',', 1) AS img_url,
                      GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                    FROM products p
                    LEFT JOIN products_images pi ON p.sku = pi.sku  -- Join por sku
                    LEFT JOIN products_prices pp ON p.sku = pp.sku  -- Join por sku
                    WHERE p.sku != 'ENVIO'`;

      const params = [];
      const conditions = [];

      if (id) {
        conditions.push(`p.id = ?`);
        params.push(id);
      }
      if (name) {
        conditions.push(`p.name LIKE ?`);
        params.push(`%${name}%`);
      }

      if (!all) {
        conditions.push(`p.adminStatus = 1 AND p.stock > 0 AND p.status = 1`);
      }

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      query += ' GROUP BY p.id';

      const [results] = await ADMINPool.query(query, params);

      if (results && results.length > 0) {
        results.forEach(result => {
          result.prices = result.prices ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':');
            const parsedValue = parseFloat(value);
            if (parsedValue >= 1000) {
              acc[key] = parsedValue;
            }
            return acc;
          }, {}) : {};

          for (let priceKey in result.prices) {
            result[priceKey] = result.prices[priceKey];
          }

          delete result.prices;
          delete result.img_urls;
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getNextId() {
    try {
      const [results] = await ADMINPool.query('SELECT MAX(id) as maxId FROM products');
      return results[0].maxId ? results[0].maxId + 1 : 1;
    }
    catch (error) {
      console.error('Error getting next product ID:', error);
      throw error;
    }
  }

  static async create({ input }) {
    try {
      const existingData = await this.getAll({ sku: input.sku });
      if (existingData.length > 0) {
        return false; // El producto ya existe
      }

      const { name, sku, price, stock, category, sub_category, description, brand, ean, img, images } = input;
      const query = `INSERT INTO products (name, sku, price, stock, category, sub_category, description, brand, ean, img, images)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await ADMINPool.query(query, [name, sku, price, stock, category, sub_category, description, brand, ean, img, images]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async update({ sku, input }) {
    try {
      const fields = Object.keys(input).map(field => `${field} = ?`).join(', ');
      const values = Object.values(input);
      values.push(sku);
      
      const query = `UPDATE products SET ${fields} WHERE sku = ?`;
      const [result] = await ADMINPool.query(query, values);
      return result.affectedRows > 0 ? true : false; 
    } 
    catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async addProductView({ id }) {
    try {
      const query = `UPDATE products SET 
                     total_views = total_views + 1, 
                     week_views = week_views + 1 
                     WHERE id = ?`;
      const [result] = await ADMINPool.query(query, [id]);
      return result.affectedRows > 0 ? true : false; 
    } 
    catch (error) {
      console.error('Error updating product views counter:', error);
      throw error;
    }
  }

  static async refreshWeekViews() {
    try {
      const query = `UPDATE products SET week_views = 0`;
      const [result] = await ADMINPool.query(query);
      return result.affectedRows > 0 ? true : false; 
    } 
    catch (error) {
      console.error('Error refreshing product views:', error);
      throw error;
    }
  }

  static async updateProductImages(sku, imageUrls) {
    try {
      // First, delete existing images for this product
      const deleteQuery = `DELETE FROM products_images WHERE sku = ?`;
      await ADMINPool.query(deleteQuery, [sku]);

      // Then insert new images
      const insertQuery = `INSERT INTO products_images (sku, img_url) VALUES ?`;
      const values = imageUrls.map(url => [sku, url]);
      const [result] = await ADMINPool.query(insertQuery, [values]);
      
      return result.affectedRows > 0;
    } 
    catch (error) {
      console.error('Error updating product images:', error);
      throw error;
    }
  }

  static async deleteProductImages(sku) {
    try {
      const query = 'DELETE FROM products_images WHERE sku = ?';
      await ADMINPool.query(query, [sku]);
      return true;
    } catch (error) {
      console.error('Error deleting product images:', error);
      throw error;
    }
  }
  
  static async insertProductImages(sku, imageUrls) {
    try {
      if (imageUrls.length === 0) return true;
  
      const values = imageUrls.map(url => [sku, url]);
      const query = 'INSERT INTO products_images (sku, img_url) VALUES ?';
      const [result] = await ADMINPool.query(query, [values]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error inserting product images:', error);
      throw error;
    }
  }
}

module.exports = ProductModel;
