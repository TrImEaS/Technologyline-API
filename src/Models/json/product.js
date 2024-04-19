const fs = require('fs')
const path = require('path')

const jsonFilePath = path.resolve(__dirname, './products.json')

class ProductModel {
  //Get all data
  static async getAll({ sku, name }) {
    let jsonData = await this.readJsonFile()

    if (sku) {
      return jsonData.filter(data => data.stock >= 3 && data.price >= 1000 && data.sku.toLowerCase() === sku.toLowerCase())
    } 

    if (name) {
      return jsonData.filter(data => data.stock >= 3 && data.price >= 1000 && data.name.toLowerCase().includes(name.toLowerCase()))
    }

    return jsonData.filter(data => data.stock >= 3 && data.price >= 1000)
  }

  //Get data by id
  static async getById(id) {
    let jsonData = await this.readJsonFile()
    return jsonData.filter(data => parseInt(data.id) === parseInt(id))
  }

  //Get last id
  static async getNextId() {
    let jsonData = await this.readJsonFile()

    // Ordenar los datos por ID en orden descendente
    jsonData.sort((a, b) => b.id - a.id)

    // Obtener el primer elemento, que será el último ID
    const lastData = jsonData[0]

    // Si no hay datos, comenzar desde 1
    const nextId = lastData ? lastData.id + 1 : 1 

    return nextId
  }

  //Create new billing data
  static async create({ input }) {
    try {
      let jsonData = await this.readJsonFile()

      // Verificar si ya existe el registro
      const existingData = jsonData.find(data =>
        data.sku === parseInt(input.sku) && 
        data.name === parseInt(input.name)
      )

      if (existingData) {
        return false
      }

      // Agregar el nuevo dato al array
      jsonData.push(input)

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(jsonData)

      console.log('New product created')
      return input
    } 
    catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  //Edit product (parcial)
  static async update({ id, input }) {
    try {
      let jsonData = await this.readJsonFile()

      const index = jsonData.findIndex(data => parseInt(data.id) === parseInt(id))

      if (index === -1) {
        return 'Error: id del producto no encontrado'
      }

      // Actualizar los datos encontrados en el índice correspondiente
      jsonData[index] = { 
        ...jsonData[index], 
        ...input 
      }

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(jsonData)

      return jsonData[index]
    } 
    catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async addProductView ({ id }) {
    try {
      let jsonData = await this.readJsonFile()

      const index = jsonData.findIndex(data => parseInt(data.id) === parseInt(id))

      if(index === -1) {
        return 'Product not found'
      }

      const productsViews = jsonData[index].total_views

      jsonData[index] = {
        ...jsonData[index],
        total_views: productsViews + 1
      }

      await this.writeJsonFile(jsonData)

      return jsonData[index]
    }
    catch (e){
      console.error('Error updating product views counter:', error)
      throw error
    }
  }
  
//--> --- --- --- --- --- --- --- --- <--//
  //Function for readJsonFile
  static async readJsonFile() {
    try {
      const rawData = await fs.promises.readFile(jsonFilePath)
      return JSON.parse(rawData)
    } catch (error) {
      console.error('Error reading JSON file:', error)
      return []
    }
  }
  
  //Function for writeJsonFile
  static async writeJsonFile(data) {
    try {
      await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error writing JSON file:', error)
      throw error
    }
  }
}


module.exports = ProductModel
