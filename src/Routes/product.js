const { Router } = require ('express')
const  ProductController  = require ('../Controllers/product.js')

const productRouter = Router()

productRouter.get('/', ProductController.getAll)
productRouter.post('/', ProductController.create)

productRouter.get('/:id', ProductController.getById)
productRouter.patch('/:id', ProductController.update)

module.exports = productRouter
