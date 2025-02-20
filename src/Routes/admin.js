const { Router } = require ('express')
const  AdminController  = require ('../Controllers/admin.js')

const adminRouter = Router()
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_data', AdminController.refreshDB)
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_prices', AdminController.refreshPrices)
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_images', AdminController.refreshImg)
adminRouter.get('/remitos/clients', AdminController.getAllClients)
adminRouter.post('/login', AdminController.login)

module.exports = adminRouter
