const pool = require('./config')
const sendMail = require('../../Utils/mail_send')

class PageModel {
  static async getResellersData({ id, name }) {
    try {
      const [results] = await pool.query('SELECT * FROM resellers_form');
      const data = results;

      if (id) { return data.filter(data => parseInt(data.id) === parseInt(id)); }
      if (name) { return data.filter(data => data.fullname.toLowerCase().includes(name.toLowerCase())) }

      return data
    } 
    catch (error) {
      console.error('Error fetching resellers form_data:', error);
      throw error;
    }
  }

  //Add new data to SellersData
  static async saveResellersData({ input }) {
    try {
      sendMail({ input })
      const data = await this.getResellersData({})

      // Verificar si ya existe el registro
      const existingData = data.find(data =>
        data.fullname === input.fullname && 
        data.email === input.email &&
        data.phone === parseInt(input.phone) &&
        data.comentary === input.comentary
      )

      if (existingData) {
        return false
      }

      // Agregar el nuevo dato al array
      const [result] = await pool.query(`
      INSERT INTO resellers_form (fullname, email, phone, comentary, view) 
      VALUES (?, ?, ?, ?, ?);
    `, [input.fullname, input.email, input.phone, input.comentary, 0]);

      return input
    } 
    catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async checkResellerData({ id }) {
    try {
      const [result] = await pool.query(`
        UPDATE resellers_form SET view = 1 WHERE id = ?;
      `, [id]);
  
      if (result.affectedRows === 0) {
        return false;  // No se encontró o actualizó ninguna fila
      }
  
      return true;  // Actualización exitosa
    } 
    catch (e) {
      console.error('Error checking view:', error)
      throw e
    }
  }
}

module.exports = PageModel