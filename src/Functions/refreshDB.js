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
      sku: (rowData[0] && rowData[0].toString().trim()) || '',
      id: parseInt(rowData[11]),
      name: (rowData[1] && rowData[1].toString()) || '',
      category: cleanCategory((rowData[12] && rowData[12].toString()) || ''),
      stock: parseInt(rowData[5]) || 0,
      sub_category: cleanCategory((rowData[2] && rowData[2].toString()) || ''),
      brand: cleanCategory((rowData[10] && rowData[10].toString()) || ''),
      tax_percentage: parseFloat(rowData[13]).toFixed(2) || 0,
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

    for (const excelProduct of productsExcel) {
      const { id, sku, name, stock, category, sub_category, brand, tax_percentage } = excelProduct;
      if (!sku) continue;
      if (sku === '16' || id === 4710) continue;
      excelProductIds.add(sku);
      console.log(excelProduct)

      if (existingProductMap.has(sku)) {
        updateProductQueries.push(connection.query(
          'UPDATE products SET gbp_id = ?, sku = ?, name = ?, stock = ?, category = ?, sub_category = ?, brand = ?, status = ?, tax_percentage = ? WHERE sku = ?',
          [id, sku, name, stock, category, sub_category, brand, stock < 0 ? 0 : 1, tax_percentage, sku]
        ));
      } 
      else {
        insertProductQueries.push(connection.query(
          `INSERT INTO products (gbp_id, sku, name, stock, category, sub_category, brand, total_views, specifications, descriptions, status, adminStatus, tax_percentage) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, sku, name, stock, category, sub_category, brand, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', 1, 1, tax_percentage]
        ));
      }
    }

    for (const [sku] of existingProductMap) {
      if (!excelProductIds.has(sku)) {
        updateProductQueries.push(connection.query(
          'UPDATE products SET stock = 0, status = 0 WHERE sku = ?',
          [sku]
        ));
      }
    }

    // Ejecutamos todas las consultas
    let hasErrors = false;

    const allQueries = [
      ...updateProductQueries,
      ...insertProductQueries,
      ...updateProductImagesQueries,
    ];

    for (const queryPromise of allQueries) {
      try {
        await queryPromise;
      } 
      catch (err) {
        hasErrors = true;
        console.error('❌ Error en query individual:', err.message);
      }
    }

    if (hasErrors) {
      await connection.rollback();
      console.log('⚠️ Transacción revertida por errores en algunas queries.');
      throw new Error('Error al ejecutar algunas queries. Se hizo rollback.');
    } else {
      await connection.commit();
      console.log('✅ Transacción completada correctamente.');
      return { success: true, message: "Base de datos actualizada correctamente" };
    }
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