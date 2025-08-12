const { ADMINPool } = require('../config.js')

exports.getAllClients = async function ({ id }) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM `clients_gbp` WHERE id = ? ', [parseInt(id)])
    const data = results

    return data
  } catch (error) {
    console.error('Error fetching resellers form_data:', error)
    throw error
  }
}

exports.getClientesEspecialesActivos = async function () {
  const connection = await ADMINPool.getConnection()
  try {
    const [rows] = await connection.query('SELECT * FROM cliente_especial WHERE activado = 1')
    return rows
  } finally {
    connection.release()
  }
}

exports.getAllClientesEspeciales = async function () {
  const connection = await ADMINPool.getConnection()
  try {
    const [rows] = await connection.query('SELECT * FROM cliente_especial')
    return rows
  } finally {
    connection.release()
  }
}
