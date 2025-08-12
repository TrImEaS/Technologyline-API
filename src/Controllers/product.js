// const { validatePartialProduct, validateProduct } = require('../Schemas/product.js');
const ProductModel = require('../Models/sql/product/index.js')
const fs = require('fs')
const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE = isDev
  ? path.join(__dirname, '../FakeStatic/products-images')
  : '/home/realcolorweb/public_html/technologyline.com.ar/products-images'

const IMAGE_PATH = isDev
  ? 'http://localhost:8080/products-images'
  : 'https://technologyline.com.ar/products-images/'

function logError (errorMessage) {
  const logFilePath = path.join(__dirname, '../Data/log_error.txt')
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${errorMessage}\n`

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err)
    }
  })
}

class ProductController {
  static async getAll (req, res) {
    try {
      const { sku, name, all } = req.query
      const products = await ProductModel.getAll({ sku, name, all })
      res.json(products)
    } catch (error) {
      logError(`Error retrieving products: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getById (req, res) {
    try {
      const { id } = req.params
      const product = await ProductModel.getById(parseInt(id))
      if (product) return res.json(product)

      res.status(404).json({ message: 'Product not found' })
    } catch (error) {
      logError(`Error retrieving product with id ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getCategories (req, res) {
    try {
      const categories = await ProductModel.getCategories()
      if (categories) return res.json(categories)

      res.status(404).json({ message: 'Categories not found' })
    } catch (error) {
      logError(`Error retrieving product with id ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getSubcategories (req, res) {
    try {
      const { category_id } = req.query
      const subcategories = await ProductModel.getSubcategories({ category_id })
      if (subcategories) return res.json(subcategories)

      res.status(404).json({ message: 'Subcategories not found' })
    } catch (error) {
      logError(`Error retrieving product with id ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getBrands (req, res) {
    try {
      const { brand_id } = req.query
      const brands = await ProductModel.getSubcategories({ brand_id })
      if (brands) return res.json(brands)

      res.status(404).json({ message: 'Brands not found' })
    } catch (error) {
      logError(`Error retrieving product with id ${req.params.id}: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async create (req, res) {
    try {
      const inputData = {
        sku: req.body.sku,
        name: req.body.name,
        stock: parseInt(req.body.stock),
        category: req.body.category,
        sub_category: req.body.sub_category,
        brand: req.body.brand,
        descriptions: req.body.descriptions,
        specifications: req.body.specifications,
        weight: parseFloat(req.body.weight),
        volume: parseFloat(req.body.volume),
        tax_percentage: parseFloat(req.body.tax_percentage),
        gbp_id: req.body.gbp_id,
        images: req.body.images || []
      }

      // Validacion de datos
      // const result = validateProduct(inputData);
      // if (result.error) {
      //   return res.status(422).json({ error: JSON.parse(result.error.message) });
      // }

      // Validar si los datos ya existen sino subir los datos
      const existingData = await ProductModel.create({ input: inputData })
      if (!existingData) {
        return res.status(409).json({ error: 'El producto ya se encuentra en el sistema!' })
      }

      return res.status(201).json({ message: 'Product created correctly' })
    } catch (e) {
      logError(`Error to create new product: ${e.message}`)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async update (req, res) {
    try {
      // const result = validatePartialProduct(req.body);
      // console.log(result.data)
      // if (!result.success)
      //   return res.status(400).json({ error: JSON.parse(result.error.message) });

      const { sku } = req.query

      const updatedata = await ProductModel.update({ sku, input: req.body })
      return res.json(updatedata)
    } catch (e) {
      logError(`Error updating product with id ${req.query.sku}: ${e.message}`)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async addProductView (req, res) {
    try {
      // const result = validatePartialProduct(req.body);
      // if (!result.success){
      //   console.log('error')
      //   return res.status(400).json({ error: JSON.parse(result.error.message) });
      // }

      const { id } = req.params
      const updatedata = await ProductModel.addProductView({ id })
      return res.json(updatedata)
    } catch (e) {
      logError(`Error adding view to product with id ${req.query.id}: ${e.message}`)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async refreshWeekViews (req, res) {
    try {
      const updatedata = await ProductModel.refreshWeekViews()
      return res.json(updatedata)
    } catch (e) {
      logError(`Error adding view to product with id ${req.query.id}: ${e.message}`)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async addImage (req, res) {
    try {
      if (!req.file || !req.body.sku || !req.body.index) {
        return res.status(400).json({ error: 'Faltan datos requeridos (imagen, SKU o índice)' })
      }

      const { sku, index } = req.body
      const extension = path.extname(req.file.originalname)
      const suffix = `_${parseInt(index) + 1}_${Date.now()}`
      const newFileName = `${sku}${suffix}${extension}`
      const newPath = path.join(STATIC_BASE, newFileName)

      // Usar rename asíncrono con await
      await fs.promises.rename(req.file.path, newPath)

      const imageUrl = `${IMAGE_PATH}/${newFileName}`
      return res.status(200).json({
        message: 'Imagen subida correctamente',
        imageUrl
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      logError(`Error uploading image: ${error.message}`)
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path)
        } catch (unlinkErr) {
          console.error('Error deleting failed upload:', unlinkErr)
          logError(`Error deleting failed upload: ${unlinkErr.message}`)
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor al subir la imagen' })
    }
  }

  static async updateImages (req, res) {
    try {
      const { sku, images } = req.body

      if (!sku || !Array.isArray(images)) {
        return res.status(400).json({ error: 'Datos inválidos' })
      }

      // Primero eliminar todas las imágenes existentes del producto
      await ProductModel.deleteProductImages(sku)

      // Luego insertar las nuevas URLs
      const success = await ProductModel.insertProductImages(sku, images)

      if (!success) { return res.status(404).json({ error: 'Error al actualizar las imágenes' }) }

      return res.status(200).json({
        message: 'Imágenes actualizadas correctamente',
        images
      })
    } catch (error) {
      logError(`Error updating images: ${error.message}`)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

module.exports = ProductController
