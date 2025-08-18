const { Router } = require('express')
const PageController = require('../Controllers/page')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const pageRouter = Router()
const isDev = process.env.NODE_ENV !== 'production'

// const billsBase = path.join(__dirname, '../Data/bills');
const dataFolder = path.join(__dirname, '../Data')
const billsBase = isDev
  ? path.join(__dirname, '../Data/bills')
  : '/home/realcolorweb/public_html/technologyline.com.ar/bills'

const imagesFolder = isDev
  ? path.join(__dirname, '../Data/images')
  : '/home/realcolorweb/public_html/technologyline.com.ar/banners-images'

if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true })
if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true })

const storageImages = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, imagesFolder) },

  filename: (req, file, cb) => {
    const id = parseInt(req.body.id)

    if (!id || id < 1 || id > 10) {
      return cb(new Error('ID inválido o fuera de rango (1-10)'))
    }

    const timestamp = Date.now()
    const fileName = id <= 5
      ? `banner_desktop_${id}_${timestamp}.jpg`
      : `banner_mobile_${id - 5}_${timestamp}.jpg`

    cb(null, fileName)
  }

})

const storageBill = multer.diskStorage({
  destination: (req, file, cb) => {
    const clientId = req.query.clientId
    const clientDir = path.join(billsBase, `client_${clientId}`)
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true })
    }
    cb(null, clientDir)
  },
  filename: (req, file, cb) => {
    const { invoice_number, movement } = req.query
    const name = `fc-${invoice_number}_movement-${movement}.pdf`
    cb(null, name)
  }
})

const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dataFolder)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = req.body.filename
    cb(null, `${filename}${ext}`)
  }
})

const uploadImages = multer({
  storage: storageImages,
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadBill = multer({
  storage: storageBill,
  fileFilter: (_, file, cb) => {
    cb(null, file.mimetype === 'application/pdf')
  },
  limits: { fileSize: 20 * 1024 * 1024 } // hasta 20MB
})

const uploadExcel = multer({
  storage: storageExcel,
  limits: { fileSize: 50 * 1024 * 1024 }, // Máximo 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroenabled.12' // .xlsm
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato de archivo no permitido, solo .xls, .xlsx y .xlsm'))
    }
  }
})

pageRouter.get('/getCategoriesForCarrousel', PageController.getCategoriesForCarrousel)
pageRouter.get('/getOrderMovement', PageController.getOrderMovement)
pageRouter.get('/getClientOrders', PageController.getClientOrders)
pageRouter.get('/getIp', PageController.getIp)
pageRouter.get('/getBanners', PageController.getBanners)
pageRouter.get('/resellersData', PageController.getResellersData)
pageRouter.get('/getUserData', PageController.getUserData)
pageRouter.get('/getClientBill', PageController.getClientBill)
pageRouter.get('/getOrdersStates', PageController.getOrdersStates)

pageRouter.patch('/setBanner', uploadImages.single('image'), PageController.uploadImage)
pageRouter.patch('/updateBannerOrder', PageController.updateBannerOrder)
pageRouter.patch('/changeUserData', PageController.changeUserData)
pageRouter.patch('/changeUserPassword', PageController.changeUserPassword)
pageRouter.patch('/check-view/:id', PageController.checkResellerData)
pageRouter.patch('/changeOrderState', PageController.changeOrderState)
pageRouter.patch('/updateCategoriesForCarrousel', PageController.updateCategoriesForCarrousel)

pageRouter.post('/', PageController.saveResellersData)
pageRouter.post('/uploadExcel', uploadExcel.single('file'), PageController.uploadExcel)
pageRouter.post('/sendOrderEmail', PageController.sendOrderEmail)
pageRouter.post('/loginUser', PageController.loginUser)
pageRouter.post('/loginGoogle', PageController.loginGoogle)
pageRouter.post('/registerUser', PageController.registerUser)
pageRouter.post('/setOrderMovement', PageController.setOrderMovement)
pageRouter.post('/deleteBanner', PageController.deleteImage)
pageRouter.post('/uploadClientBill', uploadBill.single('bill'), PageController.uploadClientBill)

pageRouter.delete('/deleteUser', PageController.deleteUser)

module.exports = pageRouter
