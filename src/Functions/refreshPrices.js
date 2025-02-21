const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const fs = require('fs');
const { ADMINPool } = require('../Models/sql/config');

// const excelPath = path.resolve(__dirname, '../Data/prices.xlsx');
const excelPath = path.resolve(__dirname, '../Data/products.xlsx');
const logFilePath = path.resolve(__dirname, '../Data/log.txt');

async function refreshPrices() {
  console.log('Iniciando la actualización de precios...');
  const connection = await ADMINPool.getConnection();
  console.log('Conexión a la base de datos establecida');

  try {
    await connection.beginTransaction();

    const excel = await XlsxPopulate.fromFileAsync(excelPath);
    if (!excel) {
      console.log('Error al cargar el archivo Excel');
      logMessage('Error: No se pudo cargar el archivo Excel.');
      return false;
    }

    const excelSheet = excel.sheet('PVP WEB LINK DE PAGO').usedRange();
    const mapColumnNames = (rowData) => ({
      'id': rowData[0] ? rowData[0] : '',
      'sku': rowData[1] ? rowData[1] : '',
      'list': rowData[11] ? rowData[11] : '',
      'cash': rowData[4] ? cleanPrice(rowData[4]) : '',
      'threeQuotes': rowData[19] ? cleanPrice(rowData[19]) : '',
      'sixQuotes': rowData[27] ? cleanPrice(rowData[27]) : '',
      'nineQuotes': rowData[35] ? cleanPrice(rowData[35]) : '',
      'twelveQuotes': rowData[43] ? cleanPrice(rowData[43]) : '',
    });

    const productsExcel = excelSheet.value().slice(5).map(rowData => mapColumnNames(rowData));
    console.log('Productos cargados desde el Excel:', productsExcel);

    logMessage('Cargando precios...');

    await ADMINPool.query('TRUNCATE TABLE products_prices');
    const queries = [];

    for (const excelProduct of productsExcel) {
      const { id, sku, list, cash, threeQuotes, sixQuotes, nineQuotes, twelveQuotes } = excelProduct;
      if (!sku || !id) {
        logMessage('No id found, stopping process.');
        break;
      }

      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [1, id, list.toFixed(2)]));
      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [2, id, cash.toFixed(2)]));
      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [3, id, threeQuotes.toFixed(2)]));
      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [4, id, sixQuotes.toFixed(2)]));
      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [5, id, nineQuotes.toFixed(2)]));
      queries.push(ADMINPool.query('INSERT INTO products_prices (`list_id`, `product_id`, `price`) VALUES (?,?,?)', [6, id, twelveQuotes.toFixed(2)]));
      
      logMessage(`Producto actualizado: SKU: ${id}:\n Price: Cash: ${cash}\n3 Cuotas: ${threeQuotes}\n6 Cuotas: ${sixQuotes}\n9 Cuotas: ${nineQuotes}\n12 Cuotas: ${twelveQuotes}\n`);
    }

    console.log('Ejecutando consultas...');
    await Promise.all(queries);
    console.log('Consultas ejecutadas correctamente');

    logMessage('Datos cargados!');
    await connection.commit();
    return { success: true, message: "Base de datos actualizada correctamente" };

  }
  catch (e) {
    console.error('❌ Error en refresh prices:', e);
    await connection.rollback();
    console.log('⚠️ Transacción revertida.');
    
    throw new Error(`Error en refresh prices: ${e.message}`);
  }
  finally {
    connection.release();
  }
}

function cleanPrice(price) {
  if (typeof price === 'string') {
    return parseFloat(price.replace('ARS', '').trim()).toFixed(2);
  }
  return price;
}

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, fullMessage, 'utf8');
}

// refreshPrices()
module.exports = refreshPrices;
