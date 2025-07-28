const { Router } = require('express')
const ClientController = require('../Controllers/client.js')

const clientRouter = Router()

clientRouter.get('/', ClientController.getAll)
clientRouter.post('/addClient', ClientController.addClient)
// clientRouter.get('/getClient', ClientController.getClient)
// clientRouter.patch('/updateClient', ClientController.updateClient)
// clientRouter.delete('/deleteClient', ClientController.deleteClient)
clientRouter.get('/getViews', ClientController.getPageViews)
clientRouter.post('/addSubscriptor', ClientController.addSubscriber)
clientRouter.delete('/deleteSubscriptor', ClientController.deleteSubscriptor)

module.exports = clientRouter
