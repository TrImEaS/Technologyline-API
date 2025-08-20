const { ADMINPool } = require('../config')

exports.getAll = async function ({ id, sku, name, all }) {
  try {
    if (sku) {
      const querySku = `SELECT 
                            p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.status, p.adminStatus, 
                            p.specifications, p.descriptions, p.total_views, p.week_views, p.tax_percentage, p.weight, p.volume,
                            GROUP_CONCAT(DISTINCT pi.img_url ORDER BY pi.posicion ASC) AS img_urls,
                            GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                          FROM products p
                          LEFT JOIN products_images pi ON p.sku = pi.sku  -- Join por sku
                          LEFT JOIN products_prices pp ON p.sku = pp.sku  -- Join por sku
                          WHERE p.sku = ? 
                          GROUP BY p.id`

      const [results] = await ADMINPool.query(querySku, [sku])

      results.forEach(result => {
        result.prices = result.prices
          ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':')
            const parsedValue = parseFloat(value)
            if (parsedValue >= 1000) {
              acc[key] = parsedValue
            }
            return acc
          }, {})
          : {}

        result.img_urls = result.img_urls
          ? result.img_urls.split(',')
          : []

        for (const priceKey in result.prices) {
          result[priceKey] = result.prices[priceKey]
        }

        delete result.prices
      })

      return results // Devolver los productos con sku
    }

    if (all) {
      const queryAll = `SELECT 
                              p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.brand, p.status, p.adminStatus, 
                              p.specifications, p.descriptions, p.total_views, p.week_views, p.tax_percentage, p.weight, p.volume,
                              GROUP_CONCAT(DISTINCT pi.img_url) AS img_urls,
                              GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                            FROM products p
                            LEFT JOIN products_images pi ON p.sku = pi.sku  -- Join por sku
                            LEFT JOIN products_prices pp ON p.sku = pp.sku  -- Join por sku
                            GROUP BY p.id`

      const [results] = await ADMINPool.query(queryAll)

      results.forEach(result => {
        result.prices = result.prices
          ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':')
            const parsedValue = parseFloat(value)
            if (parsedValue >= 1000) {
              acc[key] = parsedValue
            }
            return acc
          }, {})
          : {}
        result.img_urls = result.img_urls
          ? result.img_urls
            .split(',')
            .sort((a, b) => {
              const matchA = a.match(/_(\d+)\./)
              const numA = parseInt(matchA ? matchA[1] : '0', 10)

              const matchB = b.match(/_(\d+)\./)
              const numB = parseInt(matchB ? matchB[1] : '0', 10)

              return numA - numB
            })
          : []

        for (const priceKey in result.prices) {
          result[priceKey] = result.prices[priceKey]
        }

        delete result.prices
      })

      return results // Devolver todos los productos
    }

    let query = `SELECT 
                      p.id, p.sku, p.name, p.stock, p.category, p.sub_category, p.week_views, p.total_views, p.brand, p.status, p.adminStatus, p.tax_percentage, p.weight, p.volume,
                      SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT pi.img_url ORDER BY pi.id), ',', 1) AS img_url,
                      GROUP_CONCAT(DISTINCT CONCAT('price_list_', pp.list_id, ':', pp.price)) AS prices
                    FROM products p
                    LEFT JOIN products_images pi ON p.sku = pi.sku
                    LEFT JOIN products_prices pp ON p.sku = pp.sku
                    WHERE p.sku != 'ENVIO'`

    const params = []
    const conditions = []

    if (id) {
      conditions.push('p.id = ?')
      params.push(id)
    }
    if (name) {
      conditions.push('p.name LIKE ?')
      params.push(`%${name}%`)
    }

    if (!all) {
      conditions.push('p.adminStatus = 1 AND p.stock > 0 AND p.status = 1')
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`
    }

    query += ' GROUP BY p.id'

    const [results] = await ADMINPool.query(query, params)

    if (results && results.length > 0) {
      results.forEach(result => {
        result.prices = result.prices
          ? result.prices.split(',').reduce((acc, price) => {
            const [key, value] = price.split(':')
            const parsedValue = parseFloat(value)
            if (parsedValue >= 1000) {
              acc[key] = parsedValue
            }
            return acc
          }, {})
          : {}

        for (const priceKey in result.prices) {
          result[priceKey] = result.prices[priceKey]
        }

        delete result.prices
        delete result.img_urls
      })
    }

    return results
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

exports.getNextId = async function () {
  try {
    const [results] = await ADMINPool.query('SELECT MAX(id) as maxId FROM products')
    return results[0].maxId ? results[0].maxId + 1 : 1
  } catch (error) {
    console.error('Error getting next product ID:', error)
    throw error
  }
}

exports.getCategories = async function () {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM categories')
    return results
  } catch (error) {
    console.error('Error getting next product ID:', error)
    throw error
  }
}

exports.getCategoriesById = async function (id) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM categories WHERE id = ?', [id])
    return results[0] || null
  } catch (error) {
    console.error('Error fetching category by id:', error)
    throw error
  }
}

exports.getSubcategories = async function ({ category_id }) {
  try {
    if (category_id) {
      const [results] = await ADMINPool.query('SELECT * FROM subcategories WHERE category_id = ?', category_id)
      return results
    }

    const [results] = await ADMINPool.query('SELECT * FROM subcategories')
    return results
  } catch (error) {
    console.error('Error getting sub_category:', error)
    throw error
  }
}

exports.getSubcategoriesById = async function (id) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM subcategories WHERE id = ?', [id])
    return results[0] || null
  } catch (error) {
    console.error('Error fetching subcategory by id:', error)
    throw error
  }
}

exports.getBrands = async function ({ brand_id }) {
  try {
    if (brand_id) {
      const [results] = await ADMINPool.query('SELECT * FROM brands WHERE id = ?', brand_id)
      return results
    }

    const [results] = await ADMINPool.query('SELECT * FROM brands')
    return results
  } catch (error) {
    console.error('Error getting brands:', error)
    throw error
  }
}

exports.getBrandById = async function (id) {
  try {
    const [results] = await ADMINPool.query('SELECT * FROM brands WHERE id = ?', [id])
    return results[0] || null
  } catch (error) {
    console.error('Error fetching brand by id:', error)
    throw error
  }
}

exports.refreshWeekViews = async function () {
  try {
    const query = 'UPDATE products SET week_views = 0'
    const [result] = await ADMINPool.query(query)
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error refreshing product views:', error)
    throw error
  }
}
