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
      const query = `
      INSERT INTO receipts (
        number, 
        employee_id, 
        deposit_date, 
        remunerative_total, 
        no_remunerative_total, 
        discount_total, 
        total, 
        in_string_total, 
        payment_place_and_date, 
        payment_period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [result] = await pool.query(query, [
        input.number, 
        input.employee_id, 
        input.deposit_date, 
        input.remunerative_total, 
        input.no_remunerative_total, 
        input.discount_total, 
        input.total, 
        input.in_string_total, 
        input.payment_place_and_date, 
        input.payment_period
      ]);

      return result;
    } 
    catch (error) {
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