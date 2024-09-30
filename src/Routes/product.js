const { Router } = require('express');
const ProductController = require('../Controllers/product.js');
const ProductControllerTest = require('../Controllers/productTest.js');
const path = require('path');
const multer = require('multer');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../Data'));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, 'products' + extension);
  },
});

const upload = multer({ storage });

const productRouter = Router();

productRouter.get('/test', ProductControllerTest.getAll);
productRouter.get('/', ProductController.getAll);
productRouter.get('/:id', ProductController.getById);

// Asegúrate de usar upload.single('file') para recibir un solo archivo
productRouter.post('/jirejfdisbjfi4iwurjknvijioeb49/refresh-data', upload.single('file'), ProductController.uploadExcel);

productRouter.post('/', ProductController.create);
productRouter.post('/addView/:id', ProductController.addProductView);
productRouter.patch('/:id', ProductController.update);

module.exports = productRouter;
