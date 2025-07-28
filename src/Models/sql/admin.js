const { ADMINPool } = require('./config')

class AdminModel {
  static async getAllClients ({ id }) {
    try {
      const [results] = await ADMINPool.query('SELECT * FROM `clients_gbp` WHERE id = ? ', [parseInt(id)])
      const data = results

      return data
    } catch (error) {
      console.error('Error fetching resellers form_data:', error)
      throw error
    }
  }
}

AdminModel.bulkInsertClients = async function (clients) {
  const connection = await ADMINPool.getConnection()
  try {
    await connection.beginTransaction()
    for (const client of clients) {
      await connection.query(
        `INSERT INTO clients_gbp
         (tipo_moneda, pais, provincia, clase_fiscal, tipo_documento, documento, razon_social, ciudad, domicilio, celular, vendedor, fecha_alta, inactivo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          client.tipo_moneda,
          client.pais,
          client.provincia,
          client.clase_fiscal,
          client.tipo_documento,
          client.documento,
          client.razon_social,
          client.ciudad,
          client.domicilio,
          client.celular,
          client.vendedor,
          client.fecha_alta,
          client.inactivo
        ]
      )
    }
    await connection.commit()
  } catch (e) {
    await connection.rollback()
    throw e
  } finally {
    connection.release()
  }
}

AdminModel.existeClientePorDocumento = async function (documento) {
  const connection = await ADMINPool.getConnection()
  try {
    const doc = String(documento).trim()
    const [rows] = await connection.query(
      'SELECT 1 FROM clients_gbp WHERE TRIM(documento) = ? LIMIT 1',
      [doc]
    )
    return rows.length > 0
  } finally {
    connection.release()
  }
}

AdminModel.insertClienteEspecial = async function (cliente) {
  const connection = await ADMINPool.getConnection()
  try {
    const [result] = await connection.query(
      `INSERT INTO cliente_especial (numero_cliente, razon_social, domicilio, ciudad, provincia, clase_fiscal, documento, tel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente.numero_cliente || null,
        cliente.razon_social,
        cliente.domicilio,
        cliente.ciudad,
        cliente.provincia,
        cliente.clase_fiscal,
        cliente.documento,
        cliente.tel || null
      ]
    )
    const [rows] = await connection.query('SELECT * FROM cliente_especial WHERE id = ?', [result.insertId])
    return rows[0]
  } finally {
    connection.release()
  }
}

AdminModel.getAllClientesEspeciales = async function () {
  const connection = await ADMINPool.getConnection()
  try {
    const [rows] = await connection.query('SELECT * FROM cliente_especial')
    return rows
  } finally {
    connection.release()
  }
}

AdminModel.setClienteEspecialActivado = async function (id, activado) {
  const connection = await ADMINPool.getConnection()
  try {
    await connection.query('UPDATE cliente_especial SET activado = ? WHERE id = ?', [!!activado, id])
  } finally {
    connection.release()
  }
}

AdminModel.getClientesEspecialesActivos = async function () {
  const connection = await ADMINPool.getConnection()
  try {
    const [rows] = await connection.query('SELECT * FROM cliente_especial WHERE activado = 1')
    return rows
  } finally {
    connection.release()
  }
}

module.exports = AdminModel
