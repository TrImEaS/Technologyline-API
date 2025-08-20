// Actualiza la posición de las imágenes de un producto
exports.updateProductImagesPosition = async function (sku, imageUrls = []) {
  let connection;
  try {
    connection = await ADMINPool.getConnection();
    await connection.beginTransaction();

    // Para cada imagen, actualizar su posición según el orden recibido
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const updateQuery = 'UPDATE products_images SET posicion = ? WHERE sku = ? AND img_url = ?';
      await connection.query(updateQuery, [i + 1, sku, url]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating image positions:', error);
    throw new Error(`Error updating image positions: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}
const { ADMINPool } = require('../config')
const { getAll } = require('./get')

exports.create = async function ({ input }) {
  let connection
  try {
    connection = await ADMINPool.getConnection()
    await connection.beginTransaction()

    // 1. Verificar si el producto ya existe
    const existingData = await getAll({ sku: input.sku })
    if (existingData.length > 0) {
      await connection.rollback()
      connection.release()
      return false
    }

    // 2. Insertar el producto principal
    const {
      name, sku, stock, category, sub_category, brand, descriptions,
      specifications, weight, volume, tax_percentage, gbp_id, images = []
    } = input

    const productQuery = `
      INSERT INTO products 
        (sku, name, stock, category, sub_category, brand, descriptions, 
         specifications, weight, volume, tax_percentage, status, adminStatus, gbp_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
    `
    const [productResult] = await connection.query(productQuery, [
      sku, name, stock, category, sub_category, brand, descriptions,
      specifications, weight, volume, tax_percentage, gbp_id
    ])

    const productId = productResult.insertId

    // 3. Insertar las imágenes si existen
    if (images.length > 0) {
      const imageValues = images.map(imgUrl => [productId, sku, imgUrl])
      const imageQuery = `
        INSERT INTO products_images 
          (product_id, sku, img_url) 
        VALUES ?
      `
      await connection.query(imageQuery, [imageValues])
    }

    await connection.commit()
    return productId
  } catch (error) {
    if (connection) {
      await connection.rollback()
      connection.release()
    }
    console.error('Error creating product:', error)
    throw new Error(`Error creating product: ${error.message}`)
  } finally {
    if (connection && connection.release) connection.release()
  }
}

exports.insertProductImages = async function (productId, sku, imageUrls = []) {
  let connection
  try {
    connection = await ADMINPool.getConnection()
    await connection.beginTransaction()

    if (imageUrls.length > 0) {
      const values = imageUrls.map(url => [productId, sku, url])
      const query = `
        INSERT INTO products_images 
          (product_id, sku, img_url) 
        VALUES ?
      `
      await connection.query(query, [values])
    }

    await connection.commit()
    return true
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Error inserting product images:', error)
    throw new Error(`Error inserting images: ${error.message}`)
  } finally {
    if (connection) connection.release()
  }
}

exports.updateProductImages = async function (productId, sku, imageUrls = []) {
  let connection
  try {
    connection = await ADMINPool.getConnection()
    await connection.beginTransaction()

    // Eliminar imágenes existentes
    const deleteQuery = 'DELETE FROM products_images WHERE product_id = ?'
    await connection.query(deleteQuery, [productId])

    // Insertar nuevas imágenes si hay
    if (imageUrls.length > 0) {
      const insertQuery = `
        INSERT INTO products_images 
          (product_id, sku, img_url) 
        VALUES ?
      `
      const values = imageUrls.map(url => [productId, sku, url])
      await connection.query(insertQuery, [values])
    }

    await connection.commit()
    return true
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Error updating product images:', error)
    throw new Error(`Error updating images: ${error.message}`)
  } finally {
    if (connection) connection.release()
  }
}

exports.createCategories = async function (data) {
  try {
    const [existing] = await ADMINPool.query('SELECT * FROM categories WHERE name = ?', [data.name])
    if (existing.length > 0) {
      if (existing[0].activo === 0) {
        await ADMINPool.query('UPDATE categories SET activo = 1 WHERE id = ?', [existing[0].id])
        return existing[0].id
      }
      return false
    }
    const fields = [...Object.keys(data), 'created_at']
    const values = [...Object.values(data), new Date()]
    const query = `INSERT INTO categories (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`
    const [result] = await ADMINPool.query(query, values)
    return result.insertId
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

exports.createSubcategories = async function (data) {
  try {
    const [existing] = await ADMINPool.query('SELECT * FROM subcategories WHERE name = ? AND category_id = ?', [data.name, data.category_id])
    if (existing.length > 0) {
      if (existing[0].activo === 0) {
        await ADMINPool.query('UPDATE subcategories SET activo = 1 WHERE id = ?', [existing[0].id])
        return existing[0].id
      }
      return false
    }
    const fields = [...Object.keys(data), 'created_at']
    const values = [...Object.values(data), new Date()]
    const query = `INSERT INTO subcategories (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`
    const [result] = await ADMINPool.query(query, values)
    return result.insertId
  } catch (error) {
    console.error('Error creating subcategory:', error)
    throw error
  }
}

exports.createBrand = async function (data) {
  try {
    const [existing] = await ADMINPool.query('SELECT * FROM brands WHERE name = ?', [data.name])
    if (existing.length > 0) {
      if (existing[0].activo === 0) {
        await ADMINPool.query('UPDATE brands SET activo = 1 WHERE id = ?', [existing[0].id])
        return existing[0].id
      }
      return false
    }
    const fields = [...Object.keys(data), 'created_at']
    const values = [...Object.values(data), new Date()]
    const query = `INSERT INTO brands (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`
    const [result] = await ADMINPool.query(query, values)
    return result.insertId
  } catch (error) {
    console.error('Error creating brand:', error)
    throw error
  }
}
