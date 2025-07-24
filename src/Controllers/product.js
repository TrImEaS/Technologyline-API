// const { validatePartialProduct, validateProduct } = require('../Schemas/product.js');
const ProductModel = require('../Models/sql/product.js');
const fs = require('fs');
const path = require('path');

function logError(errorMessage) {
  const logFilePath = path.join(__dirname, '../Data/log_error.txt');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${errorMessage}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

class ProductController {
  static async getAll(req, res) {
    try {
      const { sku, name, all } = req.query;
      const products = await ProductModel.getAll({ sku, name, all });
      res.json(products);
    } catch (error) {
      logError(`Error retrieving products: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      let { id } = req.params;
      const product = await ProductModel.getById(parseInt(id));
      if (product) return res.json(product);

      res.status(404).json({ message: 'Product not found' });
    } catch (error) {
      logError(`Error retrieving product with id ${req.params.id}: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req, res) {
    const newId = await ProductModel.getNextId();

    try {
      const inputData = {
        id: newId,
        name: req.body.name,
        sku: req.body.sku,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        category: req.body.category,
        sub_category: req.body.sub_category,
        description: req.body.description,
        total_views: 0,
        brand: req.body.brand,
        ean: req.body.ean,
        img: req.body.img,
        images: req.body.images,
      };

      // Validacion de datos
      // const result = validateProduct(inputData);
      // if (result.error) {
      //   return res.status(422).json({ error: JSON.parse(result.error.message) });
      // }

      // Validar si los datos ya existen sino subir los datos
      const existingData = await ProductModel.create({ input: inputData });
      if (!existingData) {
        return res.status(409).json({ error: 'El producto ya se encuentra en el sistema!' });
      }

      return res.status(201).json({ message: 'Product created correctly' });
    } catch (e) {
      logError(`Error to create new product: ${e.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      // const result = validatePartialProduct(req.body);
      // console.log(result.data)
      // if (!result.success)
      //   return res.status(400).json({ error: JSON.parse(result.error.message) });

      const { sku } = req.query;

      const updatedata = await ProductModel.update({ sku, input: req.body });
      return res.json(updatedata);
    } catch (e) {
      logError(`Error updating product with id ${req.query.sku}: ${e.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addProductView(req, res) {
    try {
      // const result = validatePartialProduct(req.body);
      // if (!result.success){
      //   console.log('error')
      //   return res.status(400).json({ error: JSON.parse(result.error.message) });
      // }

      const { id } = req.params;
      const updatedata = await ProductModel.addProductView({ id: id });
      return res.json(updatedata);
    } catch (e) {
      logError(`Error adding view to product with id ${req.query.id}: ${e.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refreshWeekViews(req, res) {
    try {
      const updatedata = await ProductModel.refreshWeekViews();
      return res.json(updatedata);
    } 
    catch (e) {
      logError(`Error adding view to product with id ${req.query.id}: ${e.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addImage(req, res) {
    try {
      if (!req.file || !req.body.sku || !req.body.index) {
        return res.status(400).json({ error: 'Faltan datos requeridos (imagen, SKU o índice)' });
      }

      const { sku, index } = req.body;
      const extension = path.extname(req.file.originalname);

      // Siempre usar formato con guión bajo e índice empezando desde 1
      const suffix = `_${parseInt(index) + 1}`;
      const newFileName = `${sku}${suffix}${extension}`;

      const newPath = path.join('/home/realcolorweb/public_html/technologyline.com.ar/products-images', newFileName);

      fs.renameSync(req.file.path, newPath);

      const imageUrl = `https://technologyline.com.ar/products-images/${newFileName}`;

      return res.status(200).json({ 
        message: 'Imagen subida correctamente',
        imageUrl: imageUrl
      });

    } catch (error) {
      logError(`Error uploading image: ${error.message}`);
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) logError(`Error deleting failed upload: ${err.message}`);
        });
      }
      return res.status(500).json({ error: 'Error interno del servidor al subir la imagen' });
    }
  }

  static async updateImages(req, res) {
    try {
      const { sku, images } = req.body;
      
      if (!sku || !Array.isArray(images)) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }
  
      // Primero eliminar todas las imágenes existentes del producto
      await ProductModel.deleteProductImages(sku);
  
      // Luego insertar las nuevas URLs
      const success = await ProductModel.insertProductImages(sku, images);
  
      if (!success) {
        return res.status(404).json({ error: 'Error al actualizar las imágenes' });
      }
  
      return res.status(200).json({ 
        message: 'Imágenes actualizadas correctamente',
        images: images
      });
  
    } catch (error) {
      logError(`Error updating images: ${error.message}`);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = ProductController;
