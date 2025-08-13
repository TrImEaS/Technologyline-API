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

const productGet = require('../Models/sql/product/get');
const productPost = require('../Models/sql/product/post');
const productPatch = require('../Models/sql/product/patch');
const productDelete = require('../Models/sql/product/delete');

const manageBase = '/manage';


productRouter.get(manageBase + '/categories', ProductController.getCategories);
productRouter.get(manageBase + '/categories/:id', ProductController.getCategoryById);
productRouter.post(manageBase + '/categories', ProductController.createCategory);
productRouter.patch(manageBase + '/categories/:id', ProductController.updateCategory);
productRouter.delete(manageBase + '/categories/:id', ProductController.disableCategory);


productRouter.get(manageBase + '/subcategories', ProductController.getSubcategories);
productRouter.get(manageBase + '/subcategories/:id', ProductController.getSubcategoryById);
productRouter.post(manageBase + '/subcategories', ProductController.createSubcategory);
productRouter.patch(manageBase + '/subcategories/:id', ProductController.updateSubcategory);
productRouter.delete(manageBase + '/subcategories/:id', ProductController.disableSubcategory);


productRouter.get(manageBase + '/brands', ProductController.getBrands);
productRouter.get(manageBase + '/brands/:id', ProductController.getBrandById);
productRouter.post(manageBase + '/brands', ProductController.createBrand);
productRouter.patch(manageBase + '/brands/:id', ProductController.updateBrand);
productRouter.delete(manageBase + '/brands/:id', ProductController.disableBrand);
productRouter.post('/', ProductController.create)
productRouter.post('/addImage', upload.single('image'), ProductController.addImage)

productRouter.patch('/addView/:id', ProductController.addProductView)
productRouter.patch('/', ProductController.update)
productRouter.patch('/updateImages', ProductController.updateImages)

module.exports = productRouter
