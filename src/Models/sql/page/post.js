const { ADMINPool } = require('../config')
const path = require('path')
const movementPath = path.resolve(__dirname, '../../../Data/order_movements.json')
const sendMail = require('../../../Utils/mail_send')
const { writeJsonFile, readJsonFile } = require('../../../Utils/handle_json.js')

exports.saveResellersData = async function ({ input }) {
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
    `, [input.fullname, input.email, input.phone, input.comentary, 0])

    return input
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

exports.saveOrderData = async function ({ input }) {
  try {
    const [client_id] = await ADMINPool.query('SELECT id FROM clients_ecommerce WHERE email = ?', [input.client_email.toLowerCase()])
    if (client_id.length === 0) { throw new Error('Cliente no encontrado') }

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
    )
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
      )

      if (insertDetail.affectedRows === 0) return false
    }

    return true
  } catch (error) {
    console.error('Error saving order data:', error)
    throw error
  }
}

exports.loginUser = async function ({ email, password }) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ? AND password = ?', [email, password])

    if (results.length > 0) {
      return results[0]
    } else {
      return false
    }
  } catch (error) {
    console.error('Error al logearse con google, intente nuevemente!):', error)
    throw error
  }
}

exports.loginGoogle = async function ({ email, name, sub }) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ?', [email])
    if (results.length > 0) {
      return results[0]
    } else {
      const [result] = await ADMINPool.query('INSERT INTO clients_ecommerce (username, email, fullname, google_id) VALUES (?, ?, ?, ?)', [name, email, name, sub])
      return result.insertId
    }
  } catch (error) {
    console.error('Error al logearse con google, intente nuevemente!):', error)
    throw error
  }
}

exports.registerUser = async function ({ name, username, dni, address, location, postal_code, phone, email, password }) {
  const [exists] = await ADMINPool.query('SELECT id FROM clients_ecommerce WHERE email = ?', [email.toLowerCase()])
  if (exists.length > 0) {
    const err = new Error('El correo ya está registrado')
    err.code = 'EMAIL_EXISTS'
    throw err
  }

  const [result] = await ADMINPool.query(
    'INSERT INTO clients_ecommerce (username, password, fullname, dni, phone, address, location, postal_code, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [username, password, name, dni, phone, address.toLowerCase(), location, postal_code, email.toLowerCase()]
  )

  if (result.affectedRows === 0) return false
  return result.insertId
}

exports.setOrderMovement = async function () {
  try {
    const jsonData = await readJsonFile(movementPath)

    jsonData.movement += 1 // Incrementamos correctamente
    await writeJsonFile(movementPath, jsonData) // Guardamos el archivo

    console.log('Movimiento actualizado:', jsonData.movement) // Log para depurar
    return jsonData
  } catch (error) {
    console.error('Error en setOrderMovement:', error)
    throw error // Lanzamos el error para verlo en el log del servidor
  }
}

exports.clearImagePath = async function ({ id }) {
  try {
    const [result] = await ADMINPool.query('UPDATE banners SET path = "", path_to = "" WHERE id = ?', [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al limpiar la ruta de la imagen:', error)
    throw error
  }
}

exports.setClientInvoice = async function ({ clientId, invoiceNumber, movement }) {
  const sql = 'UPDATE orders_header SET invoice_number = ? WHERE client_id = ? AND movement = ?'
  const params = [invoiceNumber, clientId, movement]
  const [result] = await ADMINPool.query(sql, params)
  if (result.affectedRows === 0) {
    throw new Error('No se encontró el cliente/pedido para actualizar factura')
  }
  return true
}

exports.addBrandForCarousel = async function ({ id_brand, image_path, active }) {
  const query = 'INSERT INTO brands_carousel (brand_id, image_path, active, created_at) VALUES (?, ?, ?, NOW())'
  const values = [id_brand, image_path, active || 1]
  const [result] = await ADMINPool.query(query, values)
  return {
    id: result.insertId,
    brand_id: id_brand,
    image_path,
    active: active || 1,
    created_at: new Date().toISOString()
  }
}

exports.regretData = async function ({ data }) {
  if (!data) return false;

  const formData = JSON.parse(data);
  
  const trackingCode = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const query = `
    INSERT INTO regret_requests 
    (fullname, dni, order_number, email, comments, tracking_code, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    formData.nombre,              
    formData.dni,                 
    formData.pedido || null,      
    formData.email,               
    formData.comentarios || null, 
    trackingCode,                  
    'recibido'                      
  ];

  const [result] = await ADMINPool.query(query, values);

  return result.affectedRows > 0 ? trackingCode : false;
};