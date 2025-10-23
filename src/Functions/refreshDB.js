const XLSX = require('xlsx')
const path = require('path')
const { ADMINPool } = require('../Models/sql/config')

const excelPath = path.resolve(__dirname, '../Data/products.xlsm')

async function refreshDB () {
  const connection = await ADMINPool.getConnection()
  try {
    await connection.beginTransaction()

    const workbook = XLSX.readFile(excelPath)
    const sheet = workbook.Sheets['stock fisico ']
    if (!sheet) throw new Error('No se encontró la hoja "stock fisico "')

    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    const data = rawData.slice(2)

    function mapColumnNames (rowData) {
      return {
        sku: String(rowData[0] || '').trim(),
        id: parseInt(rowData[11], 10),
        name: String(rowData[1] || ''),
        category: cleanCategory(String(rowData[12] || '')),
        stock: parseInt(rowData[5], 10) || 0,
        sub_category: cleanCategory(String(rowData[2] || '')),
        brand: cleanCategory(String(rowData[10] || '')),
        tax_percentage: parseFloat(rowData[13]) || 0
      }
    }

    const productsExcel = data.map(mapColumnNames)
    console.log('Cargando datos desde Excel...')

    const [existingProducts] = await connection.query('SELECT id, sku FROM products')
    const existingProductMap = {}
    existingProducts.forEach(function (product) {
      existingProductMap[product.sku] = product.id
    })

    const updateProductQueries = []
    const insertProductQueries = []
    const updateProductImagesQueries = []
    const excelProductIds = {}

    for (let i = 0; i < productsExcel.length; i++) {
      const p = productsExcel[i]
      const sku = p.sku
      if (!sku) continue
      if (sku === '16' || p.id === 4710) continue

      excelProductIds[sku] = true

      if (existingProductMap[sku]) {
        updateProductQueries.push(connection.query(
          'UPDATE products SET gbp_id = ?, sku = ?, name = ?, stock = ?, status = ?, tax_percentage = ? WHERE sku = ?',
          [p.id, sku, p.name, p.stock, p.stock < 0 ? 0 : 1, p.tax_percentage, sku]
        ))
      } else {
        insertProductQueries.push(connection.query(
          'INSERT INTO products (gbp_id, sku, name, stock, category, sub_category, brand, total_views, specifications, descriptions, status, adminStatus, tax_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, sku, p.name, p.stock, p.category, p.sub_category, p.brand, 0, 'Este producto no contiene especificaciones', 'Este producto no contiene descripcion', 1, 1, p.tax_percentage]
        ))
      }
    }

    Object.keys(existingProductMap).forEach(function (sku) {
      if (!excelProductIds[sku]) {
        updateProductQueries.push(connection.query(
          'UPDATE products SET stock = 0, status = 0 WHERE sku = ?',
          [sku]
        ))
      }
    })

    let hasErrors = false
    const allQueries = updateProductQueries.concat(insertProductQueries).concat(updateProductImagesQueries)

    for (let j = 0; j < allQueries.length; j++) {
      try {
        await allQueries[j]
      } catch (err) {
        hasErrors = true
        console.error('❌ Error en query individual:', err.message)
      }
    }

    if (hasErrors) {
      await connection.rollback()
      console.log('⚠️ Transacción revertida por errores.')
      throw new Error('Error al ejecutar algunas queries. Se hizo rollback.')
    } else {
      await connection.commit()
      console.log('✅ Transacción completada correctamente.')
      return { success: true, message: 'Base de datos actualizada correctamente' }
    }
  } catch (e) {
    await connection.rollback()
    console.error('❌ Error en refreshDB:', e.message)
    throw new Error('Error en refreshDB: ' + e.message)
  } finally {
    connection.release()
  }
}

function cleanCategory (category) {
  const cat = category.trim().toLowerCase()
  if (cat === 'electrodomesticos y aires acond') return 'ELECTRO Y AIRES'
  if (cat === 'tecnologia y celulares') return 'TECNOLOGIA'
  if (cat === 'tv-audio-video') return 'TV-AUDIO'
  if (cat === 'lavasecarropas') return 'Lavarropas'
  if (cat.indexOf('cargar') !== -1) return 'OTROS'
  return category
}

module.exports = refreshDB
