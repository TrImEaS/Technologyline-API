const { Router } = require ('express')
const  AdminController  = require ('../Controllers/admin.js')

const adminRouter = Router()
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh-data', AdminController.refreshDB)
adminRouter.get('/remitos/clients', AdminController.getAllClients)
adminRouter.post('/login', AdminController.login)

module.exports = adminRouter
