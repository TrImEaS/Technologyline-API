const { Router } = require ('express')
const  ClientController  = require ('../Controllers/client.js')

const clientRouter = Router()

clientRouter.get('/', ClientController.getAll)
clientRouter.get('/getViews', ClientController.getPageViews)
clientRouter.post('/addView', ClientController.addView)
clientRouter.post('/subscribe', ClientController.addSubscriber)

module.exports = clientRouter
