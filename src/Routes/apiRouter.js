const express = require('express')
const apiRouter = express.Router()
const productRouter = require('./product.js')
const adminRouter = require('./admin.js')
const clientRouter = require('./client.js')
const pageRouter = require('./page.js')
const billingDataRouter = require('./billingData.js')
const employeeRouter = require('./employees.js')
const conceptRouter = require('./concepts.js')
const usersRouter = require('./users.js')

// API Routes
apiRouter.use('/admin', adminRouter)
apiRouter.use('/page', pageRouter)
apiRouter.use('/products', productRouter)
apiRouter.use('/clients', clientRouter)
apiRouter.use('/billingData', billingDataRouter)
apiRouter.use('/concepts', conceptRouter)
apiRouter.use('/employees', employeeRouter)
apiRouter.use('/users', usersRouter)

module.exports = apiRouter
