const { ADMINPool } = require('../config')

exports.update = async function ({ sku, input }) {
  try {
    const fields = Object.keys(input).map(field => `${field} = ?`).join(', ')
    const values = Object.values(input)
    values.push(sku)

    const query = `UPDATE products SET ${fields} WHERE sku = ?`
    const [result] = await ADMINPool.query(query, values)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}
