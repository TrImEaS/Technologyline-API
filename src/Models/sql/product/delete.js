const { ADMINPool } = require('../config')

exports.deleteProductImages = async function (sku) {
  try {
    const query = 'DELETE FROM products_images WHERE sku = ?'
    await ADMINPool.query(query, [sku])
    return true
  } catch (error) {
    console.error('Error deleting product images:', error)
    throw error
  }
}

exports.disableCategories = async function (id) {
  try {
    const query = 'UPDATE categories SET activo = 0 WHERE id = ?'
    const [result] = await ADMINPool.query(query, [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error disabling category:', error)
    throw error
  }
}

exports.disableSubcategories = async function (id) {
  try {
    const query = 'UPDATE subcategories SET activo = 0 WHERE id = ?'
    const [result] = await ADMINPool.query(query, [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error disabling subcategory:', error)
    throw error
  }
}

exports.disableBrands = async function (id) {
  try {
    const query = 'UPDATE brands SET activo = 0 WHERE id = ?'
    const [result] = await ADMINPool.query(query, [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error disabling brand:', error)
    throw error
  }
}
