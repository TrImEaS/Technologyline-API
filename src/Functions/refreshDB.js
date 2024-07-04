const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')

// const excelPath = path.resolve(__dirname, '../Data/products.xlsx')
const excelPath = '/home/realcolorweb/public_html/technologyline.com.ar/admin/page/products.xlsx'
const jsonFilePath = path.resolve(__dirname, '../Data/products.json')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function refreshDB() {
  // console.time('refreshDB');

  const excel = await XlsxPopulate.fromFileAsync(excelPath)

  if (!excel) 
  {
    console.error('Error: No se pudo cargar el archivo Excel.')
    console.timeEnd('refreshDB');
    return false
  }

  const excelSheet = excel.sheet(0).usedRange()

  const mapColumnNames = (rowData) => ({
    'id': rowData[28],
    'sku': rowData[0],
    'name': rowData[1],
    'price': cleanPrice(rowData[6]),
    'stock': rowData[22],
    'category': rowData[24],
    'sub_category': rowData[25],
    'brand': rowData[26],
    'img_base': `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
    "discount": rowData[31] || 0
  })

  const productsExcel = excelSheet.value().slice(1).map(rowData => mapColumnNames(rowData))
  const productsJson = await readJsonFile()

  console.log('Cargando datos...')

  const productsMap = new Map(productsJson.map(product => [product.id, product]));
  
  // Escribir los datos actualizados en el archivo JSON
  for (const excelProduct of productsExcel) {
    const existingProduct = productsMap.get(excelProduct.id);
    const status = () => { return excelProduct.stock < 3 ? false : true }

    // Si el producto ya existe en el JSON, actualiza el stock
    if (existingProduct) 
    {
      existingProduct.stock = excelProduct.stock;
      existingProduct.id = excelProduct.id;
      existingProduct.name = excelProduct.name;
      existingProduct.price = excelProduct.price;
      existingProduct.discount = excelProduct.discount;
      existingProduct.status = status();
    }

    // Si el producto no existe en el JSON, se agrega
    else 
    {
      productsJson.push({
        id: excelProduct.id,
        sku: excelProduct.sku,
        name: excelProduct.name,
        price: excelProduct.price,
        stock: excelProduct.stock,
        category: excelProduct.category,
        sub_category: excelProduct.sub_category,
        brand: excelProduct.brand,
        img_base: excelProduct.img_base,
        total_views: 0,
        specifications: 'Este producto no contiene especificaciones',
        descriptions: 'Este producto no contiene descripcion',
        discount: excelProduct.discount,
        status: status(),
        adminStatus: true
      });
    }

    await writeJsonFile(productsJson);
    // await delay(3);
  }

  console.log('Datos cargados!')
  // console.timeEnd('refreshDB');
}

// Función para limpiar y convertir el precio
function cleanPrice(price) {
  if (typeof price === 'string') {
    // Eliminar "ARS" y convertir a número
    return parseFloat(price.replace('ARS', '').trim());
  }
  return price;
}

//Function for readJsonFile
async function readJsonFile() {
  try {
    const rawData = await fs.promises.readFile(jsonFilePath)
    return JSON.parse(rawData)
  } 
  catch (error) {
    console.error('Error reading JSON file:', error)
    return false
  }
}

//Function for writeJsonFile
async function writeJsonFile(data) {
  try {
    await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2))
  } 
  catch (error) {
    console.error('Error writing JSON file:', error)
    return false
  }
}

module.exports = refreshDB
