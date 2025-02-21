const { ADMINPool } = require('./config')

class ProductModel {
  static async getAll({ id, sku, name, all }) {
    try {
      if (sku) {
        const querySku = `SELECT 
                              p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.img_base, p.status, p.adminStatus, 
                              p.specifications, p.descriptions,
                              GROUP_CONCAT(DISTINCT pi.img_url) AS img_urls,
                              GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                            FROM products p
                            LEFT JOIN products_images pi ON p.id = pi.product_id
                            LEFT JOIN products_prices pp ON p.id = pp.product_id
                            WHERE p.sku = ? AND p.adminStatus = 1 AND p.stock > 0 AND p.status = 1 AND pp.list_id 
                            GROUP BY p.id`;
  
        const [results] = await ADMINPool.query(querySku, [sku]);
        // Convertir precios e imágenes a arrays
        results.forEach(result => {
          result.prices = result.prices ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':');
            const parsedValue = parseFloat(value);
            if (parsedValue >= 1000) {
              acc[key] = parsedValue;
            }
            return acc;
          }, {}) : {};
          result.img_urls = result.img_urls ? result.img_urls.split(',') : [];
  
          // Aplanar el objeto 'prices' a propiedades individuales
          for (let priceKey in result.prices) {
            result[priceKey] = result.prices[priceKey];
          }
          // Eliminar el campo 'prices' que ya se desglosó en las propiedades
          delete result.prices;
        });
        return results; // Devolver solo los resultados de la consulta con sku
      }

      if (all) {
        const querySku = `SELECT *,
                                GROUP_CONCAT(DISTINCT pi.img_url) AS img_urls,
                                GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                              FROM products p
                              LEFT JOIN products_images pi ON p.id = pi.product_id
                              LEFT JOIN products_prices pp ON p.id = pp.product_id 
                              GROUP BY p.id`;
      
        const [results] = await ADMINPool.query(querySku);
      
        results.forEach(result => {
          result.prices = result.prices ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':');
            const parsedValue = parseFloat(value);
            if (parsedValue >= 1000) {
              acc[key] = parsedValue;
            }
            return acc;
          }, {}) : {};
          result.img_urls = result.img_urls ? result.img_urls.split(',') : [];
      
          for (let priceKey in result.prices) {
            result[priceKey] = result.prices[priceKey];
          }
      
          delete result.prices;
        });
        return results;
      }
  
      let query = `SELECT p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.img_base, p.status, p.adminStatus, 
                   GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                   FROM products p
                   LEFT JOIN products_prices pp ON p.id = pp.product_id AND pp.list_id IN (1,2)`;
  
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
        query += ` WHERE sku != 'ENVIO' AND  ${conditions.join(' AND ')}`;
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
    } 
    catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
  
  static async getNextId() {
    try {
      const [results] = await ADMINPool.query('SELECT MAX(id) as maxId FROM products');
      return results[0].maxId ? results[0].maxId + 1 : 1;
    } catch (error) {
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

  static async update({ id, input }) {
    try {
      const fields = Object.keys(input).map(field => `${field} = ?`).join(', ');
      const values = Object.values(input);
      values.push(id);
      
      const query = `UPDATE products SET ${fields} WHERE id = ?`;
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
      const query = `UPDATE products SET total_views = total_views + 1 WHERE id = ?`;
      const [result] = await ADMINPool.query(query, [id]);
      return result.affectedRows > 0 ? true : false; 
    } 
    catch (error) {
      console.error('Error updating product views counter:', error);
      throw error;
    }
  }

  static async getProductImages(id) {
    try {
      const [results] = await ADMINPool.query(
        'SELECT img_url FROM products_images WHERE product_id = ?',
        [id]
      );
      return results.map(image => image.img_url); // Devuelve un array de URLs de imágenes
    } catch (error) {
      console.error('Error fetching images for id:', id, error);
      return []; // Retorna un array vacío si ocurre un error
    }
  }
}

module.exports = ProductModel;
