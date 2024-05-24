const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')

const excelPath = '/home/realcolorweb/public_html/technologyline.com.ar/admin/page/products.xlsx'
const jsonFilePath = path.resolve(__dirname, '../Data/products.json')
// const excelPath = path.resolve(__dirname, '../Data/products.xlsx')

async function refreshDB() {
  const excel = await XlsxPopulate.fromFileAsync(excelPath)
  if (!excel) {
    console.error('Error: No se pudo cargar el archivo Excel.')
    return false
  }

  const excelSheet = excel.sheet(0).usedRange()

  const mapColumnNames = (rowData) => ({
    'id': rowData[31],
    'sku': rowData[0],
    'name': rowData[1],
    'price': cleanPrice(rowData[6]),
    'stock': rowData[25],
    'category': rowData[27],
    'sub_category': rowData[28],
    'brand': rowData[29],
    'img_base': `https://technologyline.com.ar/products-images/${rowData[0]}.jpg`,
    "discount": rowData[34] || 0
  })
  const productsExcel = excelSheet.value().slice(1).map(rowData => mapColumnNames(rowData))
  const productsJson = await readJsonFile()

  productsExcel.forEach(excelProduct => {
    const existingProductIndex = productsJson.findIndex(jsonProduct => jsonProduct.id === excelProduct.id);
    const status = () => {
      if(productsJson[existingProductIndex] && productsJson[existingProductIndex].stock < 3) {
        return false
      }
      else {
        return true
      }
    }

    // Si el producto ya existe en el JSON, actualiza el stock
    if (existingProductIndex !== -1) {
      productsJson[existingProductIndex].stock = excelProduct.stock;
      productsJson[existingProductIndex].name = excelProduct.name;
      productsJson[existingProductIndex].price = excelProduct.price;
      productsJson[existingProductIndex].discount = excelProduct.discount;
      productsJson[existingProductIndex].status = status()
    } 
    // Si el producto no existe en el JSON, se agrega
    else {
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
        discount: excelProduct.discount,
        status: status(),
        admin_status: null
      });
    }
  });

  // Escribir los datos actualizados en el archivo JSON
  await writeJsonFile(productsJson)
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