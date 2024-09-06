const { Router } = require ('express')
const PageController = require('../Controllers/page')

const pageRouter = Router()
pageRouter.get('/resellersData', PageController.getResellersData)
pageRouter.get('/getIp', PageController.getIp)

pageRouter.patch('/check-view/:id', PageController.checkResellerData)
pageRouter.post('/', PageController.saveResellersData)

module.exports = pageRouter
