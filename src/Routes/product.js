const { Router } = require ('express')
const ProductController  = require ('../Controllers/product.js')
const ProductControllerTest = require('../Controllers/productTest.js')

const productRouter = Router()

productRouter.get('/test', ProductControllerTest.getAll);

productRouter.get('/', ProductController.getAll)
productRouter.post('/', ProductController.create)

productRouter.post('/addView/:id', ProductController.addProductView)

productRouter.get('/:id', ProductController.getById)
productRouter.patch('/:id', ProductController.update)

module.exports = productRouter
