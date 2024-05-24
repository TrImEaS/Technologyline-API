const { validatePartialProduct, validateProduct } = require ('../Schemas/product.js')
const { validateEmail } = require ('../Schemas/email.js')
const ProductModel = require ('../Models/json/product.js')

class ProductController {

  // Get all product
  static async getAll (req, res) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    try {
      const { sku, name, all } = req.query
      const products = await ProductModel.getAll({ sku, name, all })
      res.json(products)
    }
    catch (error) {
      console.error('Error retrieving products', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Get product by id
  static async getById (req, res) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    try {
      let { id } = req.params
      const product = await ProductModel.getById(parseInt(id))
      if (product) return res.json(product)
      
      res.status(404).json({ message: 'Product not found' })
    } 
    catch (error) {
      console.error('Error retrieving product:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Create new product
  static async create (req, res) { 
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    const newId = await ProductModel.getNextId()

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
      }
      
      //Validacion de datos
      const result = validateProduct(inputData)
      if (result.error){
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      //Validar si los datos ya existen sino subir los datos
      const existingData = await ProductModel.create({ input: inputData })
      if (!existingData) {
        return res.status(409).json({ error: 'El producto ya se encuentra en el sistema!' })
      }

      return res.status(201).json({ message: 'Product created correctly'})
    } 
    catch (e) {
      console.log('Error to create new product: ', e)

      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Edit product by id
  static async update (req, res) { 
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    try {
      const result = validatePartialProduct(req.body)
      
      if (!result.success) 
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      
      const { id } = req.params
    
      const updatedata = await ProductModel.update({ id, input: result.data })  
    
      return res.json(updatedata)

    } 
    catch (e) {
      console.log('Error updating product: ', e)

      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async addProductView (req, res) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    try {
      const result = validatePartialProduct(req.body)

      if(!result.success)
        return res.status(400).json({ error: JSON.parse(result.error.message)})

        const { id } = req.params

        const updatedata = await ProductModel.addProductView({ id })
        return res.json(updatedata)
    } 
    catch (e) {
      console.log('Error adding view to product: ', e)

      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = ProductController;
