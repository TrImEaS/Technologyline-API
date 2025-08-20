exports.updateBrandsForCarousel = async function ({ input }) {
  try {
    const { id_brand, image_path, active, id } = input
    const [result] = await ADMINPool.query(
      'UPDATE brands_carousel SET brand_id = ?, image_path = ?, active = ? WHERE id = ?',
      [id_brand, image_path, active, id]
    )
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al actualizar brands_carousel:', error)
    throw error
  }
}
exports.updateBrandsForCarousel = async function ({ input }) {
  try {
    const { id_brand, image_path, active, id } = input
    const [result] = await ADMINPool.query(
      'UPDATE brands_carousel SET brand_id = ?, image_path = ?, active = ? WHERE id = ?',
      [id_brand, image_path, active, id]
    )
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al actualizar brands_carousel:', error)
    throw error
  }
}
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

exports.updateBannerPosition = async function ({ id, position }) {
  try {
    const [result] = await ADMINPool.query('UPDATE banners SET position = ? WHERE id = ?', [position, id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error actualizando posición del banner:', error)
    throw error
  }
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

exports.updateCategoriesForCarrousel = async function ({ input }) {
  try {
    const { name, position, active, img_url, id } = input
    const [result] = await ADMINPool.query('UPDATE categories_carousel SET category = ?, img_url = ?, position = ?, active = ? WHERE id = ?', [name, img_url, position, active, id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error al cambiar el categoria:', error)
    throw error
  }
}
