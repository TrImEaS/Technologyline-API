const ProductModel = require ('../Models/sql/product.js')

class ProductControllerTest {
  static async getAll(req, res) {
    try {
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar'];
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      const { sku, name, all } = req.query;
      const products = await ProductModel.getAll({ sku, name, all });

      res.json(products);
    } 
    catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ProductControllerTest;
