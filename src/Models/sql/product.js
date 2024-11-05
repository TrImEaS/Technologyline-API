const { ADMINPool } = require('./config')

class ProductModel {
  static async getAll({ sku, name, all }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM products');
      const products = results;

      if (sku) {
        return products.filter(data => data.sku.toLowerCase() === sku.toLowerCase());
      }

      if (name) {
        return products.filter(data =>
          data.adminStatus &&
          data.stock >= 3 &&
          data.price >= 1000 &&
          data.status &&
          data.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (all) {
        return products;
      }

      return products.filter(data => 
        data.adminStatus &&
        (
          data.stock >= 3 && 
          data.price >= 1000 &&
          data.status
        )
      )
    } 
    catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM products WHERE id = ?', [id]);
      return results[0] || null; // Devuelve el primer resultado o null si no se encuentra
    } catch (error) {
      console.error('Error fetching product by ID:', error);
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
}

module.exports = ProductModel;
