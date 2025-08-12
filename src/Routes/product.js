const { Router } = require('express')
const ProductController = require('../Controllers/product.js')
const path = require('path')
const multer = require('multer')

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE = isDev
  ? path.join(__dirname, '../FakeStatic/products-images')
  : '/home/realcolorweb/public_html/technologyline.com.ar/products-images'

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(STATIC_BASE))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

const productRouter = Router()

productRouter.get('/', ProductController.getAll)
productRouter.get('/getCategories', ProductController.getCategories)
productRouter.get('/getSubcategories', ProductController.getSubcategories)
productRouter.get('/getBrands', ProductController.getBrands)
productRouter.get('/refreshWeekViews', ProductController.refreshWeekViews)
productRouter.get('/:id', ProductController.getById)

productRouter.post('/', ProductController.create)
productRouter.post('/addImage', upload.single('image'), ProductController.addImage)

productRouter.patch('/addView/:id', ProductController.addProductView)
productRouter.patch('/', ProductController.update)
productRouter.patch('/updateImages', ProductController.updateImages)

module.exports = productRouter
