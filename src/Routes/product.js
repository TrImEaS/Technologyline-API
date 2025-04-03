const { Router } = require('express');
const ProductController = require('../Controllers/product.js');
const path = require('path');
const multer = require('multer');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/home/realcolorweb/public_html/technologyline.com.ar/products-images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const productRouter = Router();

productRouter.get('/', ProductController.getAll);
productRouter.get('/refreshWeekViews', ProductController.refreshWeekViews);
productRouter.get('/:id', ProductController.getById);

productRouter.post('/', ProductController.create);
productRouter.post('/addImage', upload.single('image'), ProductController.addImage);
productRouter.patch('/addView/:id', ProductController.addProductView);
productRouter.patch('/updateImages', ProductController.updateImages);
productRouter.patch('/', ProductController.update);

module.exports = productRouter;