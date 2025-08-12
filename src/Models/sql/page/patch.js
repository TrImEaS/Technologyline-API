const { ADMINPool } = require('../config')

exports.updateImagePath = async function ({ id, fileUrl, to }) {
  try {
    const [result] = await ADMINPool.query('UPDATE banners SET path = ?, path_to = ? WHERE id = ?', [fileUrl, to, id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error en la actualización de la ruta de la imagen:', error)
    throw error
  }
}

exports.updateBannerPosition = async function ({ id, newId, name }) {
  return 0
}

exports.changeUserData = async function ({ input, email }) {
  try {
    const fields = Object.keys(input).map(field => `${field} = ?`).join(', ')
    const values = Object.values(input)
    values.push(email.toLowerCase())

    const query = `UPDATE clients_ecommerce SET ${fields} WHERE email = ?`
    const [result] = await ADMINPool.query(query, values)

    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al actualizar los datos del usuario:', error)
    throw error
  }
}

exports.changeUserPassword = async function ({ input, email }) {
  try {
    if (!input.newPassword) { throw new Error('Se requiere la nueva contraseña') }

    const [getUserPassword] = await ADMINPool.query(
      'SELECT password FROM clients_ecommerce WHERE email = ?',
      [email.toLowerCase()]
    )

    const user = getUserPassword[0]
    if (!user) return 2 // Usuario no encontrado

    const password = user.password

    if (input.actualPassword !== password) { return 1 } // Contraseña actual incorrecta

    const [setNewPass] = await ADMINPool.query(
      'UPDATE clients_ecommerce SET password = ? WHERE email = ?',
      [input.newPassword, email.toLowerCase()]
    )

    return setNewPass.affectedRows > 0
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error)
    throw error
  }
}

exports.checkResellerData = async function ({ id }) {
  try {
    const [result] = await ADMINPool.query(`
        UPDATE resellers_form SET view = 1 WHERE id = ?;
      `, [id])

    if (result.affectedRows === 0) {
      return false
    }

    return true
  } catch (e) {
    console.error('Error checking view:', e)
    throw e
  }
}

exports.changeOrderState = async function ({ orderId, state, user, observations }) {
  try {
    const [result] = await ADMINPool.query('UPDATE orders_header SET order_state = ?, user = ?, observations = ? WHERE id = ?', [+state, user, observations, +orderId])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al cambiar el estado del pedido:', error)
    throw error
  }
}
