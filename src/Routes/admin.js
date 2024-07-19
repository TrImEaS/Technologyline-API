const { Router } = require ('express')
const  AdminController  = require ('../Controllers/admin.js')

const adminRouter = Router()
adminRouter.get('/', (req,res) => res.json('welcome'))
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh-data', AdminController.refreshDB)
adminRouter.post('/login', AdminController.login)

adminRouter.get('/page', async (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/page/', 'index.html')
})

adminRouter.get('/remitos', async (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/remitos/', 'index.html')
})

module.exports = adminRouter
