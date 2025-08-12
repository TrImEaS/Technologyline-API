const { ADMINPool } = require('../config.js')

exports.setClienteEspecialActivado = async function (id, activado) {
  const connection = await ADMINPool.getConnection()
  try {
    await connection.query('UPDATE cliente_especial SET activado = ? WHERE id = ?', [!!activado, id])
  } finally {
    connection.release()
  }
}
