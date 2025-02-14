const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const { ADMINPool } = require('../Models/sql/config');

const excelPath = path.resolve(__dirname, '../Data/products.xlsx');

async function refreshDB() {
  const connection = await ADMINPool.getConnection(); // Obtener conexión
  try {
    await connection.beginTransaction(); // Iniciar transacción

    const excel = await XlsxPopulate.fromFileAsync(excelPath);
    if (!excel) throw new Error('No se pudo cargar el archivo Excel.');

    const excelSheet = excel.sheet(0).usedRange();
    const mapColumnNames = (rowData) => ({
      id: parseInt(rowData[29]),
      sku: (rowData[0] && rowData[0].toString()) || '',
      name: (rowData[1] && rowData[1].toString()) || '',
      stock: parseInt(rowData[23]) || 0,
      cost: cleanPrice(rowData[4]) || 0,
      category: cleanCategory((rowData[25] && rowData[25].toString()) || ''),
      sub_category: (rowData[26] && rowData[26].toString()) || '',
      brand: (rowData[27] && rowData[27].toString()) || '',
      img_base: `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
      discount: parseInt(rowData[32]) || 0,
    });
    
    const productsExcel = excelSheet.value().slice(1).map(mapColumnNames);
    console.log('Cargando datos...');

    const [coefficients] = await connection.query('SELECT coefficient FROM coefficient');
    
    // Leer todos los productos existentes de una vez
    const [existingProducts] = await connection.query('SELECT id, sku FROM products');
    const existingProductMap = new Map(existingProducts.map(product => [product.id, product.sku]));

    // Preparar las queries de actualización y inserción
    const updateProductQueries = [];
    const insertProductQueries = [];
    const priceQueries = [];

    for (const excelProduct of productsExcel) {
      const { id, sku, name, cost, stock, category, sub_category, brand, img_base, discount } = excelProduct;
      if (!sku) throw new Error('No SKU found, stopping process.');

      console.log(`Procesando SKU: ${sku}`);
      
      const prices = {};
      coefficients.forEach((row, index) => {
        prices[`price_list_${index + 1}`] = (cost * parseFloat(row.coefficient)).toFixed(2);
      });

      if (existingProductMap.has(id)) {
        // Preparar actualización de producto
        updateProductQueries.push(connection.query(
          'UPDATE products SET sku = ?, name = ?, stock = ?, category = ?, sub_category = ?, brand = ?, img_base = ?, discount = ?, status = ? WHERE id = ?',
          [sku, name, stock, category, sub_category, brand, img_base, discount, stock < 0 ? 0 : 1, id]
        ));
        
        // Preparar actualizaciones de precios
        for (const [listId, price] of Object.entries(prices)) {
          const listIdNumber = parseInt(listId.replace('price_list_', ''), 10);
          if (isNaN(listIdNumber)) continue;

          priceQueries.push(connection.query(
            'INSERT INTO products_prices (product_id, list_id, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE price = ?',
            [id, listIdNumber, price, price]
          ));
        }
      } else {
        // Preparar inserción de producto
        insertProductQueries.push(connection.query(
          'INSERT INTO products (id, sku, name, secondary_list, principal_list, stock, category, sub_category, brand, img_base, total_views, specifications, descriptions, discount, status, adminStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, sku, name, 2, 3, stock, category, sub_category, brand, img_base, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', discount, 1, 1]
        ));

        // Preparar inserciones de precios
        for (const [listId, price] of Object.entries(prices)) {
          const listIdNumber = parseInt(listId.replace('price_list_', ''), 10);
          if (isNaN(listIdNumber)) continue;

          priceQueries.push(connection.query(
            'INSERT INTO products_prices (product_id, list_id, price) VALUES (?, ?, ?)',
            [id, listIdNumber, price]
          ));
        }
      }
    }

    // Ejecutar todas las consultas en paralelo
    await Promise.all([
      ...updateProductQueries,
      ...insertProductQueries,
      ...priceQueries,
    ]);

    await connection.commit(); // Confirmar cambios en la base de datos
    console.log('Datos cargados!');
  } catch (e) {
    console.error('Error:', e);
    await connection.rollback(); // Deshacer cambios si hay error
    console.log('Transacción revertida.');
  } finally {
    connection.release(); // Liberar la conexión
  }
}

// Función para limpiar y convertir el precio
function cleanPrice(price) {
  if (typeof price === 'string') {
    return parseFloat(price.replace('ARS', '').trim());
  }
  return parseFloat(price) || 0;
}

// Función para limpiar la categoría
function cleanCategory(category) {
  if (category === 'ELECTRODOMESTICOS Y AIRES ACOND') {
    return 'ELECTRO Y AIRES';
  }
  if (category === 'TECNOLOGIA Y CELULARES') {
    return 'TECNOLOGIA';
  }
  if (category === 'TV-AUDIO-VIDEO') {
    return 'TV-AUDIO';
  }
  return category;
}

module.exports = refreshDB;
