const { Router } = require('express')
const ProductController = require('../Controllers/product.js')
const path = require('path')
const multer = require('multer')

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE = isDev
  ? path.join(__dirname, '../FakeStatic/products-images')
  : '/home/realcolorweb/public_html/technologyline.com.ar/products-images'

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(STATIC_BASE))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

const productRouter = Router()

productRouter.get('/', ProductController.getAll)
productRouter.get('/getCategories', ProductController.getCategories)
productRouter.get('/getSubcategories', ProductController.getSubcategories)
productRouter.get('/getBrands', ProductController.getBrands)
productRouter.get('/refreshWeekViews', ProductController.refreshWeekViews)
productRouter.get('/:id', ProductController.getById)

const productGet = require('../Models/sql/product/get');
const productPost = require('../Models/sql/product/post');
const productPatch = require('../Models/sql/product/patch');
const productDelete = require('../Models/sql/product/delete');

const manageBase = '/manage';

productRouter.get(manageBase + '/categories', async (req, res) => {
  try {
    const categories = await productGet.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

productRouter.get(manageBase + '/categories/:id', async (req, res) => {
  try {
    const category = await productGet.getCategoriesById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo categoría' });
  }
});

productRouter.post(manageBase + '/categories', async (req, res) => {
  try {
    const id = await productPost.createCategories(req.body);
    if (!id) return res.status(409).json({ error: 'La categoría ya existe y está activa' });
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error creando categoría' });
  }
});

productRouter.patch(manageBase + '/categories/:id', async (req, res) => {
  try {
    const success = await productPatch.updateCategories(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Categoría no encontrada o no actualizada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando categoría' });
  }
});

productRouter.delete(manageBase + '/categories/:id', async (req, res) => {
  try {
    const success = await productDelete.disableCategories(req.params.id);
    if (!success) return res.status(404).json({ error: 'Categoría no encontrada o no deshabilitada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deshabilitando categoría' });
  }
});

productRouter.get(manageBase + '/subcategories', async (req, res) => {
  try {
    const subcategories = await productGet.getSubcategories({ category_id: req.query.category_id });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo subcategorías' });
  }
});

productRouter.get(manageBase + '/subcategories/:id', async (req, res) => {
  try {
    const subcategory = await productGet.getSubcategoriesById(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Subcategoría no encontrada' });
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo subcategoría' });
  }
});

productRouter.post(manageBase + '/subcategories', async (req, res) => {
  try {
    const id = await productPost.createSubcategories(req.body);
    if (!id) return res.status(409).json({ error: 'La subcategoría ya existe y está activa' });
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error creando subcategoría' });
  }
});

productRouter.patch(manageBase + '/subcategories/:id', async (req, res) => {
  try {
    const success = await productPatch.updateSubcategories(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Subcategoría no encontrada o no actualizada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando subcategoría' });
  }
});

productRouter.delete(manageBase + '/subcategories/:id', async (req, res) => {
  try {
    const success = await productDelete.disableSubcategories(req.params.id);
    if (!success) return res.status(404).json({ error: 'Subcategoría no encontrada o no deshabilitada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deshabilitando subcategoría' });
  }
});

productRouter.get(manageBase + '/brands', async (req, res) => {
  try {
    const brands = await productGet.getBrands({ brand_id: req.query.brand_id });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo marcas' });
  }
});

productRouter.get(manageBase + '/brands/:id', async (req, res) => {
  try {
    const brand = await productGet.getBrandById(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo marca' });
  }
});

productRouter.post(manageBase + '/brands', async (req, res) => {
  try {
    const id = await productPost.createBrand(req.body);
    if (!id) return res.status(409).json({ error: 'La marca ya existe y está activa' });
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error creando marca' });
  }
});

productRouter.patch(manageBase + '/brands/:id', async (req, res) => {
  try {
    const success = await productPatch.updateBrand(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Marca no encontrada o no actualizada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando marca' });
  }
});

productRouter.delete(manageBase + '/brands/:id', async (req, res) => {
  try {
    const success = await productDelete.disableBrands(req.params.id);
    if (!success) return res.status(404).json({ error: 'Marca no encontrada o no deshabilitada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deshabilitando marca' });
  }
});
productRouter.post('/', ProductController.create)
productRouter.post('/addImage', upload.single('image'), ProductController.addImage)

productRouter.patch('/addView/:id', ProductController.addProductView)
productRouter.patch('/', ProductController.update)
productRouter.patch('/updateImages', ProductController.updateImages)

module.exports = productRouter
