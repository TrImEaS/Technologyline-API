const { Router } = require('express')
const ClientController = require('../Controllers/client.js')

const clientRouter = Router()

clientRouter.get('/', ClientController.getAll)
clientRouter.get('/getViews', ClientController.getPageViews)

clientRouter.post('/addClient', ClientController.addClient)
clientRouter.post('/addSubscriptor', ClientController.addSubscriber)

clientRouter.delete('/deleteSubscriptor', ClientController.deleteSubscriptor)
// clientRouter.get('/getClient', ClientController.getClient)
// clientRouter.patch('/updateClient', ClientController.updateClient)
// clientRouter.delete('/deleteClient', ClientController.deleteClient)

module.exports = clientRouter
