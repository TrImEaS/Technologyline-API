const express = require('express')
const apiRouter = express.Router()
const productRouter = require ('./product.js')
const adminRouter = require('./admin.js')
const clientRouter = require('./client.js')


apiRouter.get('/', (req, res) => res.json({ message: 'Hi welcome to the API, Route: /products.' }))

apiRouter.use('/admin', adminRouter)
apiRouter.use('/products', productRouter)
apiRouter.use('/clients', clientRouter)

module.exports = apiRouter