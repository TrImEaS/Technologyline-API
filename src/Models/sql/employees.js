const { LIQUIDSPool } = require('./config.js');

class EmployeesModel {
  static async getAll({ id, full_name, docket, company, sector, category, dni, cuil, active }) {
    try {
      let query = 'SELECT * FROM employees';
      let conditions = [];
      let params = [];

      if (id) {
        conditions.push('id = ?');
        params.push(id);
      }

      if (full_name) {
        conditions.push('full_name LIKE ?');
        params.push(`%${full_name}%`);
      }

      if (docket) {
        conditions.push('docket = ?');
        params.push(docket);
      }

      if (company) {
        conditions.push('company LIKE ?');
        params.push(`%${company}%`);
      }

      if (sector) {
        conditions.push('sector LIKE ?');
        params.push(`%${sector}%`);
      }

      if (category) {
        conditions.push('categoria LIKE ?'); 
        params.push(`%${category}%`);
      }

      if (dni) {
        conditions.push('dni LIKE ?'); 
        params.push(`%${dni}%`);
      }

      if (cuil) {
        conditions.push('cuil LIKE ?'); 
        params.push(`%${cuil}%`);
      }

      if (category) {
        conditions.push('categoria LIKE ?'); 
        params.push(`%${category}%`);
      }

      if (active) { 
        conditions.push('departure_date = ""');
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const [res] = await LIQUIDSPool.query(query, params);
      return res;
    } 
    catch (e) {
      console.error('Error getting employees db:', e);
      throw e;
    }
  }
}

module.exports = EmployeesModel;
