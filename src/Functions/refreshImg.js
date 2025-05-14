const mysql = require('mysql2/promise');
const https = require('https');
const { ADMINPool } = require('../Models/sql/config');

const dbConfig = {
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'ADMIN',
};

async function checkImageExists(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (response) => {
      resolve(response.statusCode === 200);
    })
    .on('error', () => resolve(false))
    .end();
  });
}

async function migrateImages() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('procesando imagenes...');
    await ADMINPool.query('TRUNCATE TABLE products_prices');

    const [products] = await connection.execute('SELECT sku FROM products');

    const baseUrl = 'https://technologyline.com.ar/products-images';
    const allImagePromises = [];

    for (const { sku } of products) {
      let images = [];

      const urls = [ `${baseUrl}/${sku}.jpg` ];
      for (let i = 1; i <= 9; i++) {
        urls.push(`${baseUrl}/${sku}_${i}.jpg`);
      }

      const results = await Promise.all(urls.map(checkImageExists));

      results.forEach((exists, index) => {
        if (exists) images.push([sku, urls[index]]);
      });

      if (images.length > 0) {
        // console.log(`Agregando imágenes para SKU: ${sku}`);
        allImagePromises.push(connection.query(
          'INSERT INTO products_images (sku, img_url) VALUES ?',
          [images]
        ));
      }
    }

    await Promise.all(allImagePromises);

    await connection.commit();
    console.log('Img cargadas!');
    return { success: true, message: "Imágenes actualizadas correctamente" };
  } 
  catch (e) {
    console.error('❌ Error en migrateImages:', e);
    if (connection) await connection.rollback();
    console.log('⚠️ Transacción revertida.');
    throw new Error(`Error en migrateImages: ${e.message}`);
  } 
  finally {
    if (connection) await connection.end();
  }
}

// migrateImages()
module.exports = migrateImages;
