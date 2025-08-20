// const { validatePartialProduct, validateProduct } = require('../Schemas/product.js');
const ProductModel = require('../Models/sql/product/index.js')
const { ADMINPool } = require('../Models/sql/config');
const fs = require('fs')
const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE = isDev
  ? path.join(__dirname, '../FakeStatic/products-images')
  : '/home/realcolorweb/public_html/technologyline.com.ar/products-images'

const IMAGE_PATH = isDev
  ? 'http://localhost:808/products-images'
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
  static async getCategoryById (req, res) {
    try {
      const { id } = req.params
      const category = await ProductModel.getCategoriesById(id)
      if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
      res.json(category)
    } catch (error) {
      logError(`Error obteniendo categoría: ${error.message}`)
      res.status(500).json({ error: 'Error obteniendo categoría' })
    }
  }

  static async createCategory (req, res) {
    try {
      const id = await ProductModel.createCategories(req.body)
      if (!id) return res.status(409).json({ error: 'La categoría ya existe y está activa' })
      res.status(201).json({ id })
    } catch (error) {
      logError(`Error creando categoría: ${error.message}`)
      res.status(500).json({ error: 'Error creando categoría' })
    }
  }

  static async updateCategory (req, res) {
    try {
      const success = await ProductModel.updateCategories(req.params.id, req.body)
      if (!success) return res.status(404).json({ error: 'Categoría no encontrada o no actualizada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error actualizando categoría: ${error.message}`)
      res.status(500).json({ error: 'Error actualizando categoría' })
    }
  }

  static async disableCategory (req, res) {
    try {
      const success = await ProductModel.disableCategories(req.params.id)
      if (!success) return res.status(404).json({ error: 'Categoría no encontrada o no deshabilitada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error deshabilitando categoría: ${error.message}`)
      res.status(500).json({ error: 'Error deshabilitando categoría' })
    }
  }

  static async getSubcategoryById (req, res) {
    try {
      const { id } = req.params
      const subcategory = await ProductModel.getSubcategoriesById(id)
      if (!subcategory) return res.status(404).json({ error: 'Subcategoría no encontrada' })
      res.json(subcategory)
    } catch (error) {
      logError(`Error obteniendo subcategoría: ${error.message}`)
      res.status(500).json({ error: 'Error obteniendo subcategoría' })
    }
  }

  static async createSubcategory (req, res) {
    try {
      const id = await ProductModel.createSubcategories(req.body)
      if (!id) return res.status(409).json({ error: 'La subcategoría ya existe y está activa' })
      res.status(201).json({ id })
    } catch (error) {
      logError(`Error creando subcategoría: ${error.message}`)
      res.status(500).json({ error: 'Error creando subcategoría' })
    }
  }

  static async updateSubcategory (req, res) {
    try {
      const success = await ProductModel.updateSubcategories(req.params.id, req.body)
      if (!success) return res.status(404).json({ error: 'Subcategoría no encontrada o no actualizada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error actualizando subcategoría: ${error.message}`)
      res.status(500).json({ error: 'Error actualizando subcategoría' })
    }
  }

  static async disableSubcategory (req, res) {
    try {
      const success = await ProductModel.disableSubcategories(req.params.id)
      if (!success) return res.status(404).json({ error: 'Subcategoría no encontrada o no deshabilitada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error deshabilitando subcategoría: ${error.message}`)
      res.status(500).json({ error: 'Error deshabilitando subcategoría' })
    }
  }

  static async getBrandById (req, res) {
    try {
      const { id } = req.params
      const brand = await ProductModel.getBrandById(id)
      if (!brand) return res.status(404).json({ error: 'Marca no encontrada' })
      res.json(brand)
    } catch (error) {
      logError(`Error obteniendo marca: ${error.message}`)
      res.status(500).json({ error: 'Error obteniendo marca' })
    }
  }

  static async createBrand (req, res) {
    try {
      const id = await ProductModel.createBrand(req.body)
      if (!id) return res.status(409).json({ error: 'La marca ya existe y está activa' })
      res.status(201).json({ id })
    } catch (error) {
      logError(`Error creando marca: ${error.message}`)
      res.status(500).json({ error: 'Error creando marca' })
    }
  }

  static async updateBrand (req, res) {
    try {
      const success = await ProductModel.updateBrand(req.params.id, req.body)
      if (!success) return res.status(404).json({ error: 'Marca no encontrada o no actualizada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error actualizando marca: ${error.message}`)
      res.status(500).json({ error: 'Error actualizando marca' })
    }
  }

  static async disableBrand (req, res) {
    try {
      const success = await ProductModel.disableBrands(req.params.id)
      if (!success) return res.status(404).json({ error: 'Marca no encontrada o no deshabilitada' })
      res.json({ success: true })
    } catch (error) {
      logError(`Error deshabilitando marca: ${error.message}`)
      res.status(500).json({ error: 'Error deshabilitando marca' })
    }
  }

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
      const brands = await ProductModel.getBrands({ brand_id })
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
        stock: parseInt(req.body.stock) || 0,
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

      // Validación básica
      if (!inputData.sku || !inputData.name) {
        return res.status(400).json({ error: 'SKU y nombre son requeridos' })
      }

      // Crear producto (el modelo maneja la transacción completa)
      const productId = await ProductModel.create({ input: inputData })

      if (!productId) {
        return res.status(409).json({ error: 'El producto ya existe en el sistema' })
      }

      return res.status(201).json({
        message: 'Producto creado correctamente',
        productId
      })
    } catch (e) {
      console.error('Error en ProductController.create:', e)
      logError(`Error al crear nuevo producto: ${e.message}`)
      return res.status(500).json({
        error: 'Error interno del servidor',
        details: e.message // Solo para desarrollo, quitar en producción
      })
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
      return res.status(500).json({ error: `Internal server error, ${e.message}` })
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
      if (!req.file || !req.body.index) {
        return res.status(400).json({ error: 'Faltan datos requeridos (imagen, SKU o índice)' })
      }

      const { sku, index } = req.body;
      // Usar STATIC_BASE para la ruta física y IMAGE_PATH para la URL pública
      const realPath = STATIC_BASE;
      const extension = path.extname(req.file.originalname);
      const suffix = `_${parseInt(index) + 1}_${Date.now()}`;
      const newFileName = `${sku}${suffix}${extension}`;
      const lastPath = path.join(realPath, newFileName);

      // Usar rename asíncrono con await
      await fs.promises.rename(req.file.path, lastPath);

      const imageUrl = `${IMAGE_PATH}/${newFileName}`;

      // Insertar la imagen en la base de datos
      // Obtener el product_id por SKU
      const [product] = await ProductModel.getAll({ sku });
      if (product && product.id) {
        // Obtener la posición máxima actual para ese SKU desde la base de datos
        const getMaxPosQuery = 'SELECT MAX(posicion) AS maxPos FROM products_images WHERE sku = ?';
        const [[{ maxPos }]] = await ADMINPool.query(getMaxPosQuery, [sku]);
        const posicion = (maxPos || 0) + 1;
        // Insertar en la tabla products_images
        const insertQuery = `INSERT INTO products_images (product_id, sku, img_url, posicion) VALUES (?, ?, ?, ?)`;
        await ADMINPool.query(insertQuery, [product.id, sku, imageUrl, posicion]);
      }

      return res.status(200).json({
        message: 'Imagen subida correctamente',
        imageUrl
      });
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
      const { sku, images } = req.body;
      if (!sku || !Array.isArray(images)) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }

      // Actualizar solo la posición de cada imagen
      const success = await ProductModel.updateProductImagesPosition(sku, images);
      if (!success) {
        return res.status(404).json({ error: 'Error al actualizar las posiciones de las imágenes' });
      }
      return res.status(200).json({
        message: 'Posiciones de imágenes actualizadas correctamente',
        images
      });
    } catch (error) {
      logError(`Error updating image positions: ${error.message}`);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = ProductController
