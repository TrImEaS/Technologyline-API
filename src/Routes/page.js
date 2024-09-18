const { Router } = require ('express')
const PageController = require('../Controllers/page')

const pageRouter = Router()
pageRouter.get('/resellersData', PageController.getResellersData)
pageRouter.get('/getIp', PageController.getIp)
pageRouter.get('/getBanners', PageController.getBanners);

pageRouter.post('/uploadBanner', PageController.uploadImage);
pageRouter.post('/deleteBanner', PageController.deleteImage);
pageRouter.post('/', PageController.saveResellersData)

pageRouter.patch('/check-view/:id', PageController.checkResellerData)

module.exports = pageRouter
