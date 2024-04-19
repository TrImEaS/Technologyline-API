const { Router } = require ('express')
const  AdminController  = require ('../Controllers/admin.js')

const adminRouter = Router()

adminRouter.post('/login', AdminController.login)
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh-data', AdminController.refreshDB)

module.exports = adminRouter
