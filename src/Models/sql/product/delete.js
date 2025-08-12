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
