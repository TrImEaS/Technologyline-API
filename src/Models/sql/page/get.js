const { ADMINPool } = require('../config')
const { readJsonFile } = require('../../../Utils/handle_json.js')

const path = require('path')
const movementPath = path.resolve(__dirname, '../../Data/order_movements.json')

exports.getCategoriesForCarrousel = async function () {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM categories_carousel WHERE active = 1')

    return results
  } catch (error) {
    console.error('Error fetching categories_carousel:', error)
    throw error
  }
}

exports.getOrderMovement = async function () {
  try {
    const jsonData = await readJsonFile(movementPath)
    if (jsonData) { return jsonData }

    return false
  } catch (error) {
    console.error('Error getting movement:', error)
    throw error
  }
}

exports.getClientOrders = async function ({ email, id, movement }) {
  try {
    let query = `
        SELECT 
          oh.*,
          os.name AS order_state_name,
          pl.payment_list AS payment_name
        FROM orders_header oh
        LEFT JOIN orders_states os ON oh.order_state = os.order_state
        LEFT JOIN payment_list pl ON oh.payment_list = pl.id
      `
    const params = []

    if (id || email) {
      let clientId = id
      if (!clientId) {
        const [clientRow] = await ADMINPool.query(
          'SELECT id FROM clients_ecommerce WHERE email = ?',
          [email.toLowerCase()]
        )
        if (clientRow.length === 0) throw new Error('Cliente no encontrado')
        clientId = clientRow[0].id
      }

      query += ' WHERE oh.client_id = ?'
      params.push(clientId)

      if (movement) {
        query += ' AND oh.movement = ?'
        params.push(movement)
      }
    } else if (movement) {
      query += ' WHERE oh.movement = ?'
      params.push(movement)
    }

    query += ' ORDER BY oh.date DESC'

    const [ordersHeader] = await ADMINPool.query(query, params)

    const orders = await Promise.all(ordersHeader.map(async (order) => {
      const [details] = await ADMINPool.query(
          `SELECT od.sku, od.quantity, od.price, od.discount, p.name
           FROM orders_details od
           LEFT JOIN products p ON od.sku = p.sku
           WHERE od.orders_header_id = ?`,
          [order.id]
      )

      const [clientInfo] = await ADMINPool.query(
          `SELECT id, fullname, dni, phone, address, location, postal_code, email
           FROM clients_ecommerce
           WHERE id = ?`,
          [order.client_id]
      )

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
          user: order.user,
          observations: order.observations,
          client_data: clientInfo[0] || null
        },
        order_details: details
      }
    }))

    return orders
  } catch (error) {
    console.error('Error fetching client orders:', error)
    throw error
  }
}

exports.getBanners = async function () {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM banners')

    return results
  } catch (error) {
    console.error('Error fetching banners:', error)
    throw error
  }
}

exports.getResellersData = async function ({ id, name }) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM resellers_form')

    if (id) { return results.filter(data => parseInt(data.id) === parseInt(id)) }
    if (name) { return results.filter(data => data.fullname.toLowerCase().includes(name.toLowerCase())) }

    return results
  } catch (error) {
    console.error('Error fetching resellers form_data:', error)
    throw error
  }
}

exports.gerUserData = async function ({ email }) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM clients_ecommerce WHERE email = ?', email)

    if (results.length > 0) { return results[0] }

    return false
  } catch (error) {
    console.error('Error fetching resellers form_data:', error)
    throw error
  }
}

exports.getOrdersStates = async function () {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM orders_states')

    return results
  } catch (error) {
    console.error('Error fetching order states:', error)
    throw error
  }
}
