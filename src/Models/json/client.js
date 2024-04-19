const fs = require('fs')
const path = require('path')

const jsonFilePath = path.resolve(__dirname, '../../Data/clients.json')

class ClientModel {
  //Get all data
  static async getAll({ id }) {
    let jsonData = await this.readJsonFile()

    if (id) {
      return jsonData.find(data => parseInt(data.id) === parseInt(id))
    } 

    return jsonData
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

  static async addSubscriber({ input }) {
    try {
      let jsonData = await this.readJsonFile()

      // Verificar si ya existe el registro
      const existingData = jsonData.find(data => data.email === input.email)

      if (existingData) {
        return false
      }

      // Agregar el nuevo dato al array
      jsonData.push(input)

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(jsonData)

      console.log('New email pushed')
      return input
    } 
    catch (error) {
      console.error('Error pushing email:', error)
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

module.exports = ClientModel
