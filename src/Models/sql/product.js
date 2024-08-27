const { Sequelize } = require('sequelize')
const Product = require('./sequelize-schemas/ProductSchema.js')

const sequelize = new Sequelize('ADMIN', 'Thomas2024az', 'Dacarry-123@', {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize.sync().then(() => {
  console.log('Connection success!');
});

class ProductModel {
  //Get all data
  static async getAll({ sku, name, all }) {
    try {
      const products = await Product.findAll()

      if (sku) {
        return products.filter(data => 
          data.sku.toLowerCase() === sku.toLowerCase())
      } 
  
      if (name) {
        return products.filter(data => 
          data.adminStatus &&
          (
            data.stock >= 3 && 
            data.price >= 1000 && 
            data.status && 
            data.name.toLowerCase().includes(name.toLowerCase())
          )
        )
      }
  
      if (all){
        return products
      }

      return products.filter(product => 
        product.adminStatus === true &&
        product.price > 1000 &&
        product.status === true  
      )
    } 
    catch (e) { console.error('Error fetching all products: ', e) }
  }

  //Get data by id
  static async getById(id) {
    const product = await Product.findByPk(parseInt(id));
    if(!product) {
      return 'Producto no encontrado'
    }
    return product
  }

  //Get last id
  static async getNextId() {
    const products = await Product.findAll()

    // Ordenar los datos por ID en orden descendente
    products.sort((a, b) => b.id - a.id)

    // Obtener el primer elemento, que será el último ID
    const lastData = products[0]

    // Si no hay datos, comenzar desde 1
    const nextId = lastData ? lastData.id + 1 : 1 

    return nextId
  }

  //Create new billing data
  static async create({ input }) {
    try {
      // Verificar si ya existe el registro
      const existingData = await Product.findOne({
        where: {
          sku: input.sku,
          name: input.name
        }
      });

      if (existingData) {
        return false; // Producto ya existe
      }

      // Crear el nuevo producto
      const newProduct = await Product.create(input);

      console.log('New product created');
      return newProduct; // Retorna el producto creado
    } 
    catch (error) {
      console.error('Error creating product:', error);
      throw error; // Propaga el error para su manejo en otros lugares
    }
  }

  //Edit product (parcial)
  static async update({ id, input }) {
    try {
      // Buscar el producto por ID
      const product = await Product.findByPk(id);

      if (!product) {
        return 'Error: ID del producto no encontrado';
      }

      // Actualizar el producto con los nuevos datos
      await product.update(input);

      // Retornar el producto actualizado
      return product;
    } 
    catch (error) {
      console.error('Error updating product:', error);
      throw error; // Propaga el error para su manejo en otros lugares
    }
  }

  static async addProductView ({ id }) {
    try {
      // Buscar el producto por ID
      const product = await Product.findByPk(id);

      if (!product) {
        return 'Product not found';
      }

      // Incrementar el contador de vistas
      product.total_views = (product.total_views || 0) + 1;

      // Guardar los cambios en la base de datos
      await product.save();

      // Retornar el producto actualizado
      return product;
    } 
    catch (error) {
      console.error('Error updating product views counter:', error);
      throw error; // Propaga el error para su manejo en otros lugares
    }
  }
}

module.exports = { ProductModel }