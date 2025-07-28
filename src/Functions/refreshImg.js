const mysql = require('mysql2/promise')
const https = require('https')
const { ADMINPool } = require('../Models/sql/config')

const dbConfig = {
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'ADMIN'
}

async function checkImageExists (url) {
  return new Promise((resolve) => {
    https
      .request(url, { method: 'HEAD' }, (res) => {
        resolve(res.statusCode === 200)
      })
      .on('error', () => resolve(false))
      .end()
  })
}

async function migrateImages () {
  let connection
  try {
    connection = await mysql.createConnection(dbConfig)
    await connection.beginTransaction()

    console.log('Procesando imágenes...')
    await connection.query('TRUNCATE TABLE products_images')

    const [products] = await connection.execute('SELECT sku FROM products')
    const baseUrl = 'https://technologyline.com.ar/products-images'
    const imageInserts = []

    for (const row of products) {
      const sku = row.sku
      const urls = [baseUrl + '/' + sku + '.jpg']
      for (let i = 1; i <= 9; i++) {
        urls.push(baseUrl + '/' + sku + '_' + i + '.jpg')
      }

      const existsArray = await Promise.all(urls.map(checkImageExists))
      for (let i = 0; i < existsArray.length; i++) {
        if (existsArray[i]) {
          imageInserts.push([sku, urls[i]])
        }
      }
    }

    if (imageInserts.length > 0) {
      await connection.query(
        'INSERT INTO products_images (sku, img_url) VALUES ?',
        [imageInserts]
      )
    }

    await connection.commit()
    console.log('Imágenes cargadas!')
    return { success: true, message: 'Imágenes actualizadas correctamente' }
  } catch (e) {
    console.error('❌ Error en migrateImages:', e)
    if (connection) {
      await connection.rollback()
    }
    throw new Error('Error en migrateImages: ' + e.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

module.exports = migrateImages
