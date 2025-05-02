const { Router } = require('express');
const PageController = require('../Controllers/page');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pageRouter = Router();

const dataFolder = path.join(__dirname, '../Data');
const imagesFolder = '/home/realcolorweb/public_html/technologyline.com.ar/banners-images';

if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true });

const storageImages = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, imagesFolder) },
  
  filename: (req, file, cb) => {
    const id = parseInt(req.body.id);
  
    if (!id ||  id < 1 || id > 10) {
      return cb(new Error('ID inválido o fuera de rango (1-10)'));
    }
  
    const timestamp = Date.now();
    const fileName = id <= 5
      ? `banner_desktop_${id}_${timestamp}.jpg`
      : `banner_mobile_${id - 5}_${timestamp}.jpg`;
  
    cb(null, fileName);
  },
  
});

const uploadImages = multer({
  storage: storageImages,
  limits: { fileSize: 10 * 1024 * 1024 },
})

const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dataFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = req.body.filename;
    cb(null, `${filename}${ext}`);
  },
});

const uploadExcel = multer({
  storage: storageExcel,
  limits: { fileSize: 50 * 1024 * 1024 }, // Máximo 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no permitido, solo .xls y .xlsx'));
    }
  },
});

pageRouter.get('/getCategoriesForCarrousel', PageController.getCategoriesForCarrousel);
pageRouter.get('/getOrderMovement', PageController.getOrderMovement);
pageRouter.get('/getIp', PageController.getIp);
pageRouter.get('/getBanners', PageController.getBanners);
pageRouter.get('/resellersData', PageController.getResellersData);
pageRouter.get('/getUserData', PageController.getUserData);

pageRouter.patch('/setBanner', uploadImages.single('image'), PageController.uploadImage);
pageRouter.patch('/updateBannerPosition', PageController.updateBannerPosition);
pageRouter.patch('/check-view/:id', PageController.checkResellerData);
pageRouter.patch('/changeUserData', PageController.changeUserData);

pageRouter.post('/', PageController.saveResellersData);
pageRouter.post('/uploadExcel', uploadExcel.single('file'), PageController.uploadExcel);
pageRouter.post('/sendOrderEmail', PageController.sendOrderEmail);
pageRouter.post('/loginUser', PageController.loginUser);
pageRouter.post('/registerUser', PageController.registerUser);
pageRouter.post('/setOrderMovement', PageController.setOrderMovement);
pageRouter.post('/deleteBanner', PageController.deleteImage);

pageRouter.delete('/deleteUser', PageController.deleteUser);

module.exports = pageRouter;
