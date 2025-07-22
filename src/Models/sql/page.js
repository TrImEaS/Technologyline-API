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

  static async gerUserData({ email }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ?', email);

      if(results.length > 0)
        return results[0]

      return false
    } 
    catch (error) {
      console.error('Error fetching resellers form_data:', error);
      throw error;
    }
  }

  static async changeUserData({ input, email }) {
    try {
      const fields = Object.keys(input).map(field => `${field} = ?`).join(', ');
      const values = Object.values(input);
      values.push(email.toLowerCase());

      const query = `UPDATE clients_ecommerce SET ${fields} WHERE email = ?`;
      const [result] = await ADMINPool.query(query, values);

      return result.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error('Error al actualizar los datos del usuario:', error);
      throw error;
    }
  }

  static async changeUserPassword({ input, email }) {
    try {
      if (!input.newPassword) 
        throw new Error('Se requiere la nueva contraseña');

      const [getUserPassword] = await ADMINPool.query(
        `SELECT password FROM clients_ecommerce WHERE email = ?`,
        [email.toLowerCase()]
      );

      const user = getUserPassword[0];
      if (!user) return 2; // Usuario no encontrado

      const password = user.password;

      if (input.actualPassword !== password) 
        return 1; // Contraseña actual incorrecta

      const [setNewPass] = await ADMINPool.query(
        `UPDATE clients_ecommerce SET password = ? WHERE email = ?`,
        [input.newPassword, email.toLowerCase()]
      );

      return setNewPass.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
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

  static async saveOrderData({ input }) {
    try {
      const [client_id] = await ADMINPool.query('SELECT id FROM clients_ecommerce WHERE email = ?', [input.client_email.toLowerCase()])
      if (client_id.length === 0)
        throw new Error('Cliente no encontrado');

      const [insertOrderHeader] = await ADMINPool.query(`
        INSERT INTO orders_header (movement, client_id, invoice_number, total_articles, total_price, payment_list, company, order_state) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
          +input.movimiento_numero, 
          client_id[0].id, '', 
          input.productos.length, 
          input.total, 
          input.abona_en, 
          input.company, 
          1
        ]
      );
      if (insertOrderHeader.affectedRows === 0) return false

      for (const product of input.productos) {
        const [insertDetail] = await ADMINPool.query(`
          INSERT INTO orders_details (orders_header_id, sku, quantity, price, discount) 
          VALUES (?, ?, ?, ?, ?)`,
          [
            insertOrderHeader.insertId,
            product.sku,
            product.cantidad_seleccionada,
            parseFloat(product.precio).toFixed(2),
            parseFloat(product.descuento).toFixed(2) || 0
          ]
        );

        if (insertDetail.affectedRows === 0) return false;
      }

      return true
    } 
    catch (error) {
      console.error('Error saving order data:', error);
      throw error;
    }
  }

  static async getClientOrders({ email, id, movement }) {
    try {
      let query = `
        SELECT 
          oh.*,
          os.name AS order_state_name,
          pl.payment_list AS payment_name
        FROM orders_header oh
        LEFT JOIN orders_states os ON oh.order_state = os.order_state
        LEFT JOIN payment_list pl ON oh.payment_list = pl.id
      `;
      const params = [];

      if (id || email) {
        let clientId = id;
        if (!clientId) {
          const [clientRow] = await ADMINPool.query(
            'SELECT id FROM clients_ecommerce WHERE email = ?',
            [email.toLowerCase()]
          );
          if (clientRow.length === 0) throw new Error('Cliente no encontrado');
          clientId = clientRow[0].id;
        }

        query += ' WHERE oh.client_id = ?';
        params.push(clientId);

        if (movement) {
          query += ' AND oh.movement = ?';
          params.push(movement);
        }
      } else if (movement) {
        query += ' WHERE oh.movement = ?';
        params.push(movement);
      }

      query += ' ORDER BY oh.date DESC';

      const [ordersHeader] = await ADMINPool.query(query, params);

      const orders = await Promise.all(ordersHeader.map(async (order) => {
        const [details] = await ADMINPool.query(
          `SELECT od.sku, od.quantity, od.price, od.discount, p.name
           FROM orders_details od
           LEFT JOIN products p ON od.sku = p.sku
           WHERE od.orders_header_id = ?`,
          [order.id]
        );

        const [clientInfo] = await ADMINPool.query(
          `SELECT id, fullname, dni, phone, address, location, postal_code, email
           FROM clients_ecommerce
           WHERE id = ?`,
          [order.client_id]
        );

        return {
          order_header: {
            id: order.id,
            movement: order.movement,
            invoice_number: order.invoice_number,
            total_articles: order.total_articles,
            date: order.date,
            total_price: order.total_price,
            address: order.address,
            company: order.company,
            payment: order.payment_name,
            order_state: order.order_state_name,
            client_data: clientInfo[0] || null
          },
          order_details: details
        };
      }));

      return orders;

    } catch (error) {
      console.error('Error fetching client orders:', error);
      throw error;
    }
  }

  static async getOrdersStates() {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM orders_states');

      return results
    } 
    catch (error) {
      console.error('Error fetching order states:', error);
      throw error;
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
        const [result] = await ADMINPool.query('INSERT INTO clients_ecommerce (username, email, fullname, google_id) VALUES (?, ?, ?, ?)', [name, email, name, sub]);
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

  static async registerUser ({ name, username, dni, address, location, postal_code, phone, email, password }) {
    try {
      const [exists] = await ADMINPool.query('SELECT id FROM clients_ecommerce WHERE email = ?', [email.toLowerCase()]);
      if (exists.length > 0) {
        const err = new Error('El correo ya está registrado');
        err.code = 'EMAIL_EXISTS';
        throw err;
      }

      const [result] = await ADMINPool.query(
        'INSERT INTO clients_ecommerce (username, password, fullname, dni, phone, address, location, postal_code, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, name, dni, phone, address.toLowerCase(), location, postal_code, email.toLowerCase()]
      );

      if (result.affectedRows === 0) return false;
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async setClientInvoice({ clientId, invoiceNumber, movement }) {
    const sql = `UPDATE orders_header SET invoice_number = ? WHERE client_id = ? AND movement = ?`;
    const params = [invoiceNumber, clientId, movement];
    const [result] = await ADMINPool.query(sql, params);
    if (result.affectedRows === 0) {
      throw new Error('No se encontró el cliente/pedido para actualizar factura');
    }
    return true;
  }

  static async changeOrderState({ orderId, state }) {
    try {
      const [result] = await ADMINPool.query('UPDATE orders_header SET order_state = ? WHERE id = ?', [+state, +orderId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al cambiar el estado del pedido:', error);
      throw error;
    }
  }
}

module.exports = PageModel