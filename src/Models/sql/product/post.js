const { ADMINPool } = require('../config')

exports.create = async function ({ input }) {
  try {
    const existingData = await this.getAll({ sku: input.sku })
    if (existingData.length > 0) {
      return false
    }

    const { name, sku, category, sub_category, brand, descriptions, specifications, weight, volume, tax_percentage, gbp_id } = input
    const query = `INSERT INTO products  (sku, name, stock, category, sub_category, brand, descriptions, specifications, weight, volume, tax_percentage, status, adminStatus, gbp_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const [result] = await ADMINPool.query(query, [sku, name, 0, category, sub_category, brand, descriptions, specifications, weight, volume, tax_percentage, 1, 1, gbp_id])
    return result.insertId
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

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

exports.insertProductImages = async function (sku, imageUrls) {
  try {
    if (imageUrls.length === 0) return true

    const values = imageUrls.map(url => [sku, url])
    const query = 'INSERT INTO products_images (sku, img_url) VALUES ?'
    const [result] = await ADMINPool.query(query, [values])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error inserting product images:', error)
    throw error
  }
}

exports.updateProductImages = async function (sku, imageUrls) {
  try {
    // First, delete existing images for this product
    const deleteQuery = 'DELETE FROM products_images WHERE sku = ?'
    await ADMINPool.query(deleteQuery, [sku])

    // Then insert new images
    const insertQuery = 'INSERT INTO products_images (sku, img_url) VALUES ?'
    const values = imageUrls.map(url => [sku, url])
    const [result] = await ADMINPool.query(insertQuery, [values])

    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating product images:', error)
    throw error
  }
}
