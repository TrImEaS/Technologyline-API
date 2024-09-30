const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const pool = require('../Models/sql/config');

const excelPath = path.resolve(__dirname, '../Data/products.xlsx');

async function refreshDB() {
  const excel = await XlsxPopulate.fromFileAsync(excelPath);
  if (!excel) {
    console.error('Error: No se pudo cargar el archivo Excel.');
    return false;
  }

  const excelSheet = excel.sheet(0).usedRange();
  const mapColumnNames = (rowData) => ({
    'id': parseInt(rowData[29]),
    'sku': rowData[0].toString(),
    'name': rowData[1].toString(),
    'price': cleanPrice(rowData[6]),
    'stock': parseInt(rowData[23]),
    'category': cleanCategory(rowData[25].toString()),
    'sub_category': rowData[26].toString(),
    'brand': rowData[27].toString(),
    'img_base': `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
    "discount": parseInt(rowData[32]) || 0,
  });

  const productsExcel = excelSheet.value().slice(1).map(rowData => mapColumnNames(rowData));
  console.log('Cargando datos...');

  // Procesar cada producto
  for (const excelProduct of productsExcel) {
    const { id, sku, name, price, stock, category, sub_category, brand, img_base, discount } = excelProduct;
    const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (existingProduct.length > 0) {
      await pool.query(
        'UPDATE products SET sku = ?, name = ?, price = ?, stock = ?, category = ?, sub_category = ?, brand = ?, img_base = ?, discount = ?, status = ? WHERE id = ?',
        [sku, name, price, stock, category, sub_category, brand, img_base, discount, stock < 3 ? 0 : 1, id]
      );
    } 
    else {
      await pool.query(
        'INSERT INTO products (id, sku, name, price, stock, category, sub_category, brand, img_base, total_views, specifications, descriptions, discount, status, adminStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, sku, name, price, stock, category, sub_category, brand, img_base, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', discount, 1, 1]
      );
    }
  }

  console.log('Datos cargados!');
}

// Función para limpiar y convertir el precio
function cleanPrice(price) {
  if (typeof price === 'string') {
    return parseFloat(price.replace('ARS', '').trim());
  }
  return price;
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