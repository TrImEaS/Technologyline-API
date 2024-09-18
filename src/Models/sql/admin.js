const pool = require('./config')

class AdminModel {
  static async getAllClients({ id }) {
    try {
      const [results] = await pool.query('SELECT * FROM `clients_gbp` WHERE id = ? ', [parseInt(id)]);
      const data = results;

      return data
    } 
    catch (error) {
      console.error('Error fetching resellers form_data:', error);
      throw error;
    }
  }
}

module.exports = AdminModel