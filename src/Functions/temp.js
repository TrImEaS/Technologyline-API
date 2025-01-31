const mysql = require('mysql2/promise');
const https = require('https');

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'ADMIN',
};

async function checkImageExists(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      let data = [];

      // Acumular los datos de la respuesta
      response.on('data', (chunk) => data.push(chunk));

      // Cuando termina de recibir la respuesta
      response.on('end', () => {
        const htmlContent = Buffer.concat(data).toString();

        // Si la respuesta contiene el texto de error 404, sabemos que la imagen no existe
        if (htmlContent.includes("404 error") || htmlContent.includes("No pudimos encontrar lo que estas buscando")) {
          resolve(false); // Imagen no encontrada
        } else {
          // Si no contiene el texto de error, entonces se asume que la imagen es válida
          resolve(true); // Imagen encontrada
        }
      });
    }).on('error', () => resolve(false)); // Si hay un error en la solicitud
  });
}


// Función principal para migrar las imágenes
async function migrateImages() {
  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Obtener todos los productos
    const [products] = await connection.execute('SELECT id, sku FROM products');

    for (const product of products) {
      const { id, sku } = product;
      const baseUrl = 'https://technologyline.com.ar/products-images';

      let images = [];
      let imageFound = false;

      // Verificar la imagen principal
      const mainImage = `${baseUrl}/${sku}.jpg`;
      if (await checkImageExists(mainImage)) {
        images.push([id, mainImage]);
        imageFound = true;
      }

      // Verificar imágenes adicionales (max 9 imágenes)
      for (let i = 1; i <= 9; i++) {
        const additionalImage = `${baseUrl}/${sku}_${i}.jpg`;
        if (await checkImageExists(additionalImage)) {
          images.push([id, additionalImage]);
          imageFound = true;
        }
      }

      // Insertar las imágenes si hay alguna encontrada
      if (imageFound && images.length > 0) {
        await connection.query(
          'INSERT INTO products_images (product_id, img_url) VALUES ?',
          [images]
        );
        console.log(`Se insertaron ${images.length} imágenes para SKU: ${sku}`);
      }
    }

    console.log('Migración de imágenes completada.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = migrateImages;
