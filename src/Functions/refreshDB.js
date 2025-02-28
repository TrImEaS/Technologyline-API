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
      sku: (rowData[0] && rowData[0].toString()) || '',
      id: parseInt(rowData[11]),
      name: (rowData[1] && rowData[1].toString()) || '',
      category: cleanCategory((rowData[12] && rowData[12].toString()) || ''),
      stock: parseInt(rowData[5]) || 0,
      sub_category: cleanCategory((rowData[2] && rowData[2].toString()) || ''),
      brand: cleanCategory((rowData[10] && rowData[10].toString()) || ''),
      img_base: `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
    });
    const productsExcel = excelSheet.value().slice(2).map(mapColumnNames);
    console.log('Cargando datos...');

    // Obtener productos existentes de la base de datos
    const [existingProducts] = await connection.query('SELECT id, sku FROM products');
    const existingProductMap = new Map(existingProducts.map(product => [product.sku, product.id]));

    const updateProductQueries = [];
    const insertProductQueries = [];
    const updateProductImagesQueries = [];
    const excelProductIds = new Set();
    // Recorremos todos los productos del Excel
    for (const excelProduct of productsExcel) {
      const { id, sku, name, stock, category, sub_category, brand, img_base } = excelProduct;
      // Saltamos las filas sin SKU en lugar de lanzar un error
      if (!sku) continue;
      if (sku === 16 || id === 4710) continue;

      excelProductIds.add(sku);
      console.log(`Procesando SKU: ${sku}`);

      // Si el producto ya existe en la base de datos
      if (existingProductMap.has(sku)) {
        const dbProductId = existingProductMap.get(sku);
        
        // Actualizamos el producto en la tabla `products`
        updateProductQueries.push(connection.query(
          'UPDATE products SET id = ?, sku = ?, name = ?, stock = ?, category = ?, sub_category = ?, brand = ?, img_base = ?, status = ? WHERE id = ?',
          [id, sku, name, stock, category, sub_category, brand, img_base, stock < 0 ? 0 : 1, dbProductId]
        ));

        // Actualizamos las imágenes del producto en `products_images`
        updateProductImagesQueries.push(connection.query(
          'UPDATE products_images SET product_id = ? WHERE product_id = ?',
          [id, dbProductId]
        ));
      } 
      // Si el producto no existe, lo insertamos
      else {
        insertProductQueries.push(connection.query(
          `INSERT INTO products (id, sku, name, stock, category, sub_category, brand, img_base, total_views, specifications, descriptions, status, adminStatus) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, sku, name, stock, category, sub_category, brand, img_base, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', 1, 1]
        ));
        
        // Insertamos las imágenes correspondientes
        updateProductImagesQueries.push(connection.query(
          'UPDATE products_images SET product_id = ? WHERE product_id = ?',
          [id, id]
        ));
      }
    }

    // Modificamos la query para usar SKU en lugar de ID
    const deactivateProductsQuery = connection.query(
      'UPDATE products SET stock = 0, status = 0 WHERE sku NOT IN (?)',
      [Array.from(excelProductIds)]
    );

    // Ejecutamos todas las consultas
    await Promise.all([
      ...updateProductQueries,
      ...insertProductQueries,
      ...updateProductImagesQueries,
      deactivateProductsQuery
    ]);

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

// refreshDB()
module.exports = refreshDB;