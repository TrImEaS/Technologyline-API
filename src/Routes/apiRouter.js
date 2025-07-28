const express = require('express')
const apiRouter = express.Router()
const productRouter = require('./product.js')
const adminRouter = require('./admin.js')
const clientRouter = require('./client.js')
const pageRouter = require('./page.js')

// API Routes
apiRouter.use('/admin', adminRouter)
apiRouter.use('/page', pageRouter)
apiRouter.use('/products', productRouter)
apiRouter.use('/clients', clientRouter)

module.exports = apiRouter
