const { ADMINPool } = require('./config')

class ProductModel {
  static async getAll({ id, sku, name, all }) {
    try {
      let query = `SELECT p.*, pi.img_url 
                   FROM products p
                   LEFT JOIN products_images pi ON p.id = pi.product_id`;
  
      const params = [];
      const conditions = [];
  
      if (id) {
        conditions.push(`p.id = ?`);
        params.push(id);
      }
      if (sku) {
        conditions.push(`p.sku = ?`);
        params.push(sku);
      }
      if (name) {
        conditions.push(`p.name LIKE ?`);
        params.push(`%${name}%`);
      }
      if (!all) {
        conditions.push(`p.adminStatus = 1 AND p.stock > 0 AND p.price >= 1000 AND p.status = 1`);
      }
  
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
  
      const [results] = await ADMINPool.query(query, params);
  
      // Agrupar imágenes por producto
      const productsMap = new Map();
  
      results.forEach(product => {
        if (!productsMap.has(product.id)) {
          productsMap.set(product.id, { 
            ...product, 
            images: []
          });
        }
        if (product.img_url) {
          productsMap.get(product.id).images.push(product.img_url);
        }
      });
  
      return [...productsMap.values()];
    } catch (error) {
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
