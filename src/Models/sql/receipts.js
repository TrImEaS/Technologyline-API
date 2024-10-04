const pool = require('./config')

class ReceiptsModel {
  static async getAll({ id, number, employee_id, deposit_date }) {
    try {
      let query = 'SELECT * FROM receipts';
      let conditions = [];
      let params = [];

      if (id) {
        conditions.push('id = ?');
        params.push(id);
      }

      if (number) {
        conditions.push('number = ?');
        params.push(number);
      }

      if (employee_id) {
        conditions.push('employee_id = ?');
        params.push(employee_id);
      }

      if (deposit_date) {
        conditions.push('deposit_date = ?');
        params.push(deposit_date);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const [res] = await pool.query(query, params);
      return res;
    } 
    catch (error) {
      console.error('Error fetching receipt/s:', error);
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
      const [result] = await pool.query(query, [name, sku, price, stock, category, sub_category, description, brand, ean, img, images]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }

  }

  static async update({ id, input }) {
    
  }

  static async delete({ id }) {
    
  }
}

module.exports = ReceiptsModel