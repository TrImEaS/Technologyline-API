const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const { ADMINPool } = require('../Models/sql/config');

const excelPath = path.resolve(__dirname, '../Data/products.xlsx');

async function refreshDB() {
  try{
    const excel = await XlsxPopulate.fromFileAsync(excelPath);
    if (!excel) {
      console.error('Error: No se pudo cargar el archivo Excel.');
      return false;
    }

    // const excelSheet = excel.sheet('PVP WEB LINK DE PAGO').usedRange();
    // const mapColumnNames = (rowData) => ({
    //   'id': rowData[25] ? parseInt(rowData[25]) : '',
    //   'sku': rowData[0] ? rowData[0].toString() : '',
    //   'name': rowData[1] ? rowData[1].toString() : '',
    //   'price': rowData[10] ? cleanPrice(rowData[10]) : '',
    //   'stock': rowData[26] ? parseInt(rowData[26]) : 0,
    //   'category': rowData[23] ? cleanCategory(rowData[23].toString()) : '',
    //   'sub_category': rowData[24] ? rowData[24].toString() : '',
    //   'brand': rowData[28] ? rowData[28].toString() : '',
    //   'img_base': `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
    //   "discount": rowData[29] ? parseInt(rowData[29]) || 0 : 0,
    // });

    const excelSheet = excel.sheet(0).usedRange();
    const mapColumnNames = (rowData) => ({
      'id': parseInt(rowData[29]),
      'sku': rowData[0].toString(),
      'name': rowData[1].toString(),
      'stock': parseInt(rowData[23]),
      'cost': cleanPrice(rowData[4]),
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
      const { id, sku, name, cost, stock, category, sub_category, brand, img_base, discount } = excelProduct;
      if (!sku) {
        console.log('No SKU found, stopping process.');
        break;
      }

      const formula = await ADMINPool.query('SELECT formula FROM formula WHERE id = 1',);

      const [existingProduct] = await ADMINPool.query('SELECT * FROM products WHERE id = ?', [id]);

      if (existingProduct.length > 0) {
        await ADMINPool.query(
          'UPDATE products SET sku = ?, name = ?, stock = ?, category = ?, sub_category = ?, brand = ?, img_base = ?, discount = ?, status = ? WHERE id = ?',
          [sku, name, stock, category, sub_category, brand, img_base, discount, stock < 0 ? 0 : 1, id]
        );

        const [existingPrice] = await ADMINPool.query('SELECT * FROM products_prices WHERE list_id = ? AND id_product = ?' [1, id]);

        if(existingPrice.lenght > 0) {
          await ADMINPool.query(
            'UPDATE products_prices SET price = ?',
            [cost]
          );
        }
        else {
          await ADMINPool.query(
            'INSERT INTO products_prices (id_product, list_id, price) VALUES (?, ?, ?)',
            [id, 1, cost]
          )
        }
      } 
      else {
        await ADMINPool.query(
          'INSERT INTO products (id, sku, name, secondary_list, principal_list, stock, category, sub_category, brand, img_base, total_views, specifications, descriptions, discount, status, adminStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, sku, name, 2, 3, stock, category, sub_category, brand, img_base, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', discount, 1, 1]
        );

        await ADMINPool.query(
          'INSERT INTO products_prices (id_product, list_id, price) VALUES (?, ?, ?)',
          [id, 1, cost]
        )
      }
    }

    console.log('Datos cargados!');
  }
  catch(e){
    return false
  }
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

// refreshDB()
module.exports = refreshDB;