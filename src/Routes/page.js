const { Router } = require('express');
const PageController = require('../Controllers/page');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/home/realcolorweb/public_html/technologyline.com.ar/banners-images'); 
  },
  filename: (req, file, cb) => {
    const { id } = req.body; 
    const timestamp = Date.now(); 

    let fileName;
    if (id >= 1 && id <= 5) {
      fileName = `banner_desktop_${id}_${id}_${timestamp}.jpg`;
    } else if (id >= 6 && id <= 10) {
      const mobileId = id - 5; 
      fileName = `banner_mobile_${mobileId}_${id}_${timestamp}.jpg`;
    } else {
      return cb(new Error('ID fuera de rango'));
    }

    cb(null, fileName); 
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 5MB
});

const pageRouter = Router();
pageRouter.post('/setBanner', upload.single('image'), PageController.uploadImage);
pageRouter.post('/', PageController.saveResellersData);
pageRouter.post('/deleteBanner', PageController.deleteImage);
pageRouter.get('/getIp', PageController.getIp);
pageRouter.get('/getBanners', PageController.getBanners);
pageRouter.get('/resellersData', PageController.getResellersData);
pageRouter.patch('/check-view/:id', PageController.checkResellerData);

module.exports = pageRouter;
