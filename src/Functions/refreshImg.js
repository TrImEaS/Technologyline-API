const mysql = require('mysql2/promise');
const https = require('https');
const { ADMINPool } = require('../Models/sql/config');

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'ADMIN',
};

// Verifica si una imagen existe usando HEAD en vez de GET para ahorrar ancho de banda
async function checkImageExists(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (response) => {
      resolve(response.statusCode === 200);
    })
    .on('error', () => resolve(false))
    .end();
  });
}

// Migración optimizada
async function migrateImages() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('procesando imagenes...')
    await ADMINPool.query('TRUNCATE TABLE products_prices');

    // Obtener todos los productos
    const [products] = await connection.execute('SELECT id, sku FROM products');

    const baseUrl = 'https://technologyline.com.ar/products-images';
    const allImagePromises = [];

    for (const { id, sku } of products) {
      let images = [];
      
      // Generar URLs de imágenes a verificar (paralelismo)
      const urls = [ `${baseUrl}/${sku}.jpg` ];
      for (let i = 1; i <= 9; i++) {
        urls.push(`${baseUrl}/${sku}_${i}.jpg`);
      }

      // Verificar existencia en paralelo
      const results = await Promise.all(urls.map(checkImageExists));

      // Filtrar imágenes encontradas
      results.forEach((exists, index) => {
        if (exists) images.push([id, urls[index]]);
      });

      // Agregar al lote de inserciones
      if (images.length > 0) {
        console.log('Agregando imagenes...')

        allImagePromises.push(connection.query(
          'INSERT INTO products_images (product_id, img_url) VALUES ?',
          [images]
        ));
      }

    }

    // Insertar todas las imágenes en paralelo
    await Promise.all(allImagePromises);

    await connection.commit();
    return { success: true, message: "Imagenes actualizadas correctamente" };
  } 
  catch (e) {
    console.error('❌ Error en refresh images:', e);
    await connection.rollback();
    console.log('⚠️ Transacción revertida.');
    
    throw new Error(`Error en refresh images: ${e.message}`);
  } 
  finally {
    if (connection) await connection.end();
  }
}

// migrateImages()
module.exports = migrateImages;
