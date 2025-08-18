const { ADMINPool } = require('../config')

exports.addProductView = async function ({ id }) {
  try {
    const query = `UPDATE products SET 
                     total_views = total_views + 1, 
                     week_views = week_views + 1 
                     WHERE id = ?`
    const [result] = await ADMINPool.query(query, [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating product views counter:', error)
    throw error
  }
}

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

exports.updateCategories = async function (id, data) {
  try {
    const fields = []
    const values = []
    for (const key in data) {
      fields.push(`${key} = ?`)
      values.push(data[key])
    }
    values.push(id)
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`
    const [result] = await ADMINPool.query(query, values)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

exports.updateSubcategories = async function (id, data) {
  try {
    const fields = []
    const values = []
    for (const key in data) {
      fields.push(`${key} = ?`)
      values.push(data[key])
    }
    values.push(id)
    const query = `UPDATE subcategories SET ${fields.join(', ')} WHERE id = ?`
    const [result] = await ADMINPool.query(query, values)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating subcategory:', error)
    throw error
  }
}

exports.updateBrand = async function (id, data) {
  try {
    const fields = []
    const values = []
    for (const key in data) {
      fields.push(`${key} = ?`)
      values.push(data[key])
    }
    values.push(id)
    const query = `UPDATE brands SET ${fields.join(', ')} WHERE id = ?`
    const [result] = await ADMINPool.query(query, values)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating brand:', error)
    throw error
  }
}
