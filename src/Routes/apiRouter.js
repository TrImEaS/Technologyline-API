const express = require('express')
const apiRouter = express.Router()
const productRouter = require ('./product.js')
const adminRouter = require('./admin.js')
const clientRouter = require('./client.js')
const pageRouter = require('./page.js')
const conceptRouter = require('./concepts.js')
const employeesRouter = require('./employees.js')

//API Routes
apiRouter.use('/page', pageRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/products', productRouter)
apiRouter.use('/clients', clientRouter)
apiRouter.use('/concepts', conceptRouter)
apiRouter.use('/employees', employeesRouter)

module.exports = apiRouter