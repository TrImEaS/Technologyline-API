const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const { ADMINPool } = require('../Models/sql/config');

const excelPath = path.resolve(__dirname, '../Data/products.xlsx');

async function refreshDB() {
  const connection = await ADMINPool.getConnection();
  try {
    await connection.beginTransaction();

    const excel = await XlsxPopulate.fromFileAsync(excelPath);
    if (!excel) throw new Error('No se pudo cargar el archivo Excel.');

    const excelSheet = excel.sheet('stock fisico ').usedRange();
    const mapColumnNames = (rowData) => ({
      id: parseInt(rowData[12]),
      sku: (rowData[1] && rowData[1].toString()) || '',
      name: (rowData[2] && rowData[2].toString()) || '',
      stock: parseInt(rowData[6]) || 0,
      category: cleanCategory((rowData[13] && rowData[13].toString()) || ''),
      sub_category: cleanCategory((rowData[3] && rowData[3].toString()) || ''),
      brand: cleanCategory((rowData[11] && rowData[11].toString()) || ''),
      img_base: `https://technologyline.com.ar/products-images/${rowData[1]}.jpg`,
    });
    const productsExcel = excelSheet.value().slice(2).map(mapColumnNames);
    console.log(excelSheet.value().slice(2,10));
    console.log('Cargando datos...');

    // Obtener productos existentes de la base de datos
    const [existingProducts] = await connection.query('SELECT id, sku FROM products');
    const existingProductMap = new Map(existingProducts.map(product => [product.sku, product.id]));

    const updateProductQueries = [];
    const insertProductQueries = [];
    const updateProductImagesQueries = [];
    const excelProductIds = new Set();

    // Recorremos todos los productos del Excel
    // for (const excelProduct of productsExcel) {
    //   const { id, sku, name, stock, category, sub_category, brand, img_base } = excelProduct;
    //   if (!sku) throw new Error('No SKU found, stopping process.');
    //   if (sku === 16 || id === 4710) continue;

    //   excelProductIds.add(id);
    //   console.log(`Procesando SKU: ${sku}`);

    //   // Si el producto ya existe en la base de datos
    //   if (existingProductMap.has(sku)) {
    //     const dbProductId = existingProductMap.get(sku);
        
    //     // Actualizamos el producto en la tabla `products`
    //     updateProductQueries.push(connection.query(
    //       'UPDATE products SET id = ?, sku = ?, name = ?, stock = ?, category = ?, sub_category = ?, brand = ?, img_base = ?, status = ? WHERE id = ?',
    //       [id, sku, name, stock, category, sub_category, brand, img_base, stock < 0 ? 0 : 1, dbProductId]
    //     ));

    //     // Actualizamos las imágenes del producto en `products_images`
    //     updateProductImagesQueries.push(connection.query(
    //       'UPDATE products_images SET product_id = ? WHERE product_id = ?',
    //       [id, dbProductId]
    //     ));
    //   } 
    //   // Si el producto no existe, lo insertamos
    //   else {
    //     insertProductQueries.push(connection.query(
    //       `INSERT INTO products (id, sku, name, stock, category, sub_category, brand, img_base, total_views, specifications, descriptions, status, adminStatus) 
    //        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //       [id, sku, name, stock, category, sub_category, brand, img_base, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', 1, 1]
    //     ));
        
    //     // Insertamos las imágenes correspondientes
    //     updateProductImagesQueries.push(connection.query(
    //       'UPDATE products_images SET product_id = ? WHERE product_id = ?',
    //       [id, id]
    //     ));
    //   }
    // }

    // // Marcar como inactivos los productos que no están en el Excel
    // const deactivateProductsQuery = connection.query(
    //   'UPDATE products SET stock = 0, status = 0 WHERE id NOT IN (?)',
    //   [Array.from(excelProductIds)]
    // );

    // // Ejecutamos todas las consultas
    // await Promise.all([
    //   ...updateProductQueries,
    //   ...insertProductQueries,
    //   ...updateProductImagesQueries,
    //   deactivateProductsQuery
    // ]);

    await connection.commit();
    console.log('Datos cargados, productos actualizados y desactivados correctamente.');

    return { success: true, message: "Base de datos actualizada correctamente" };
  } 
  catch (e) {
    console.error('❌ Error en refreshDB:', e);
    await connection.rollback();
    console.log('⚠️ Transacción revertida.');

    throw new Error(`Error en refreshDB: ${e.message}`);
  } 
  finally {
    connection.release();
  }
}

function cleanCategory(category) {
  const cat = category.trim().toLowerCase();

  if (cat === 'electrodomesticos y aires acond') {
    return 'ELECTRO Y AIRES';
  }
  if (cat === 'tecnologia y celulares') {
    return 'TECNOLOGIA';
  }
  if (cat === 'tv-audio-video') {
    return 'TV-AUDIO';
  }
  if (cat.includes('cargar')) {
    return 'OTROS';
  }
  return category;
}

refreshDB()
module.exports = refreshDB;
