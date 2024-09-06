const pool = require('./config')

class ProductModel {
  static async getAll({ sku, name, all }) {
    try {
      const [results] = await pool.query('SELECT * FROM products');
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
      throw error; // Propaga el error para que el controlador pueda manejarlo
    }
  }
}

module.exports = ProductModel;
