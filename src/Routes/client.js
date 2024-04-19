const { Router } = require ('express')
const  ClientController  = require ('../Controllers/client.js')

const clientRouter = Router()

clientRouter.get('/', ClientController.getAll)
clientRouter.post('/subscribe', ClientController.addSubscriber)

module.exports = clientRouter
