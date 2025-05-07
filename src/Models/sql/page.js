const { ADMINPool } = require('./config')
const sendMail = require('../../Utils/mail_send')
const fs = require('fs')
const path = require('path')

const movementPath = path.resolve(__dirname, '../../Data/order_movements.json')

class PageModel {
  static async getResellersData({ id, name }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM resellers_form');

      if (id) { return results.filter(data => parseInt(data.id) === parseInt(id)); }
      if (name) { return results.filter(data => data.fullname.toLowerCase().includes(name.toLowerCase())) }

      return results
    } 
    catch (error) {
      console.error('Error fetching resellers form_data:', error);
      throw error;
    }
  }

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
      const [result] = await ADMINPool.query(`
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
      const [result] = await ADMINPool.query(`
        UPDATE resellers_form SET view = 1 WHERE id = ?;
      `, [id]);
  
      if (result.affectedRows === 0) {
        return false; 
      }
  
      return true;
    } 
    catch (e) {
      console.error('Error checking view:', error)
      throw e
    }
  }

  static async getBanners() {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM banners');

      return results
    } 
    catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }

  static async updateImagePath({ id, fileUrl, to }) {
    try {
      const [result] = await ADMINPool.query('UPDATE banners SET path = ?, path_to = ? WHERE id = ?', [fileUrl, to, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en la actualización de la ruta de la imagen:', error);
      throw error;
    }
  }

  static async clearImagePath({ id }) {
    try {
      const [result] = await ADMINPool.query('UPDATE banners SET path = "", path_to = "" WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al limpiar la ruta de la imagen:', error);
      throw error;
    }
  }

  static async getOrderMovement(req, res) {
    try {
      let jsonData = await this.readJsonFile(movementPath);
      if(jsonData)
        return jsonData

      return false
    } 
    catch (error) {
      console.error('Error getting movement:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async setOrderMovement() {
    try {
      let jsonData = await this.readJsonFile(movementPath);
  
      jsonData.movement += 1; // Incrementamos correctamente
      await this.writeJsonFile(movementPath, jsonData); // Guardamos el archivo
  
      console.log('Movimiento actualizado:', jsonData.movement); // Log para depurar
      return jsonData;
    } 
    catch (error) {
      console.error('Error en setOrderMovement:', error);
      throw error; // Lanzamos el error para verlo en el log del servidor
    }
  }

  static async readJsonFile(path) {
    try {
      const rawData = await fs.promises.readFile(path)
      return JSON.parse(rawData)
    } 
    catch (error) {
      console.error('Error reading JSON file:', error)
      return []
    }
  }
  
  static async writeJsonFile(path ,data) {
    try {
      await fs.promises.writeFile(path, JSON.stringify(data, null, 2))
    } 
    catch (error) {
      console.error('Error writing JSON file:', error)
      throw error
    }
  }

  static async getCategoriesForCarrousel() {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM categories_carousel WHERE active = 1');

      return results
    } 
    catch (error) {
      console.error('Error fetching categories_carousel:', error);
      throw error;
    }
  }

  static async loginGoogle ({ email, name, sub }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ?', [email]);
      
      if (results.length > 0) {
        return results[0]
      } 
      else {
        const [result] = await ADMINPool.query('INSERT INTO clients_ecommerce (username, email, fullname, google_id) VALUES (?, ?, ?)', [name, email, name, sub]);
        return result.insertId
      }
    } 
    catch (error) {
      console.error('Error al logearse con google, intente nuevemente!):', error);
      throw error;
    }
  }

  static async loginUser ({ email, password }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ? AND password = ?', [email, password]);
      
      if (results.length > 0) {
        return results[0]
      } 
      else {
        return false
      }
    } 
    catch (error) {
      console.error('Error al logearse con google, intente nuevemente!):', error);
      throw error;
    }
  }

  static async registerUser ({ name, username, dni, address, postalCode, phone, email, password }) {
    try {
      const [result] = await ADMINPool.query('INSERT INTO clients_ecommerce (username, password, fullname, dni, phone, address, postal_code, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                                                                      [username, password, name, dni, phone, address.toLowerCase(), postalCode, email.toLowerCase()]);
      if (result.affectedRows === 0) {
        return false
      }
      return result.insertId
    } 
    catch (error) {
      console.error('Error al registrarse, intente nuevemente!):', error);
      throw error;
    }
  }
    
}

module.exports = PageModel