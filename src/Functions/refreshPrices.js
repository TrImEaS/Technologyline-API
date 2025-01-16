const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const fs = require('fs');
const { ADMINPool } = require('../Models/sql/config');

const excelPath = path.resolve(__dirname, '../Data/prices.xlsx');
const logFilePath = path.resolve(__dirname, '../Data/log.txt');

async function refreshPrices() {
  try {
    const excel = await XlsxPopulate.fromFileAsync(excelPath);
    if (!excel) {
      logMessage('Error: No se pudo cargar el archivo Excel.');
      return false;
    }

    const excelSheet = excel.sheet('PVP WEB LINK DE PAGO').usedRange();
    const mapColumnNames = (rowData) => ({
      'sku': rowData[0] ? rowData[0].toString() : '',
      'price': rowData[10] ? cleanPrice(rowData[10]) : '',
    });

    const productsExcel = excelSheet.value().slice(5).map(rowData => mapColumnNames(rowData));
    logMessage('Cargando datos...');

    logMessage(mapColumnNames);

    // Procesar cada producto
    for (const excelProduct of productsExcel) {
      const { sku, price } = excelProduct;
      if (!sku) {
        logMessage('No SKU found, stopping process.');
        break;
      }

      const [existingProduct] = await ADMINPool.query('SELECT sku, price FROM products WHERE sku = ?', [sku]);

      if (existingProduct.length > 0) {
        await ADMINPool.query(
          'UPDATE products SET sku = ?, price = ? WHERE sku = ?',
          [sku, price, sku]
        );

        logMessage(`Producto actualizado: SKU: ${sku}, Price: ${price} `);
      } 
      else {
        logMessage(`No se encontró producto: ${sku}`);
      }
    }

    logMessage('Datos cargados!');
  } 
  catch (e) {
    logMessage(`Error: ${e.message}`);
    return false;
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

module.exports = refreshPrices;
