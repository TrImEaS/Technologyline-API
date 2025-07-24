const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { ADMINPool } = require('../Models/sql/config');

const excelPath  = path.resolve(__dirname, '../Data/products.xlsm');
const logFile    = path.resolve(__dirname, '../Data/log.txt');

async function refreshPrices() {
  const conn = await ADMINPool.getConnection();
  try {
    await conn.beginTransaction();
    const wb    = XLSX.readFile(excelPath);
    const sheet = wb.Sheets['PVP WEB LINK DE PAGO'];
    if (!sheet) throw new Error('Hoja "PVP WEB LINK DE PAGO" no encontrada');

    const rows = XLSX.utils.sheet_to_json(sheet, { header:1, defval:'' }).slice(5);
    const products = rows.map(row => ({
      sku          : String(row[1] || ''),
      list         : row[11] || '',
      cash         : row[4]  ? cleanPrice(row[4])  : '',
      threeQuotes  : row[19] ? cleanPrice(row[19]) : '',
      sixQuotes    : row[27] ? cleanPrice(row[27]) : '',
      nineQuotes   : row[35] ? cleanPrice(row[35]) : '',
      twelveQuotes : row[43] ? cleanPrice(row[43]) : ''
    }));

    log('Cargando precios...');
    await conn.query('TRUNCATE TABLE products_prices');

    const inserts = [];
    products.forEach(p => {
      if (!p.sku) { log('Sin SKU, deteniendo'); return; }
      [1,2,3,4,5,6].forEach(listId => {
        const price = ({
          1: p.list,
          2: p.cash,
          3: p.threeQuotes,
          4: p.sixQuotes,
          5: p.nineQuotes,
          6: p.twelveQuotes
        })[listId];
        inserts.push(conn.query(
          'INSERT INTO products_prices (list_id, sku, price) VALUES (?,?,?)',
          [listId, p.sku, parseFloat(price).toFixed(2)]
        ));
      });
    });

    await Promise.all(inserts);
    await conn.commit();
    log('✅ Precios actualizados');
    return { success:true, message:'Base de datos actualizada correctamente' };

  } catch (e) {
    await conn.rollback();
    console.error(e);
    throw e;
  } finally {
    conn.release();
  }
}

function cleanPrice(str) {
  const s = String(str).replace('ARS','').trim().replace(',','.');
  return parseFloat(s);
}

function log(msg) {
  const ts = new Date().toISOString();
  fs.appendFileSync(logFile, `[${ts}] ${msg}\n`, 'utf8');
}

module.exports = refreshPrices;
