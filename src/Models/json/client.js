const fs = require('fs')
const path = require('path')

const clientPath = path.resolve(__dirname, '../../Data/clients.json')
const statisticsPath = path.resolve(__dirname, '../../Data/statistics.json')

class ClientModel {
  //Get all data
  static async getAll({ id }) {
    let jsonData = await this.readJsonFile(clientPath)

    if (id) {
      return jsonData.find(data => parseInt(data.id) === parseInt(id))
    } 

    return jsonData
  }

  //Get last id
  static async getNextId() {
    let jsonData = await this.readJsonFile(clientPath)

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
      let jsonData = await this.readJsonFile(clientPath)

      // Verificar si ya existe el registro
      const existingData = jsonData.find(data => data.email === input.email)

      if (existingData) {
        return false
      }

      // Agregar el nuevo dato al array
      jsonData.push(input)

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(clientPath, jsonData)

      console.log('New email pushed')
      return input
    } 
    catch (error) {
      console.error('Error pushing email:', error)
      throw error
    }
  }

  static async getPageViews() {
    let jsonData = await this.readJsonFile(statisticsPath);
    return jsonData.views;
  }

  static async deleteClient({ id }) {
    try {
      let jsonData = await this.readJsonFile(clientPath);
  
      // Filtrar los datos para eliminar el cliente con el ID especificado
      const updatedData = jsonData.filter(data => parseInt(data.id) !== parseInt(id));
  
      // Verificar si se eliminó algún cliente
      if (jsonData.length === updatedData.length) {
        // No se encontró ningún cliente con el ID proporcionado
        console.log(`Client with ID ${id} not found.`);
        return false;
      }
  
      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(clientPath, updatedData);
  
      console.log(`Client with ID ${id} deleted successfully.`);
      return true;
    } 
    catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
  

  //--> --- --- --- --- --- --- --- --- <--//
  //Function for readJsonFile
  static async readJsonFile(path) {
    try {
      const rawData = await fs.promises.readFile(path)
      return JSON.parse(rawData)
    } 
    catch (error) {
      console.error('Error reading JSON file:', error)
      return []
    }
  }
  
  //Function for writeJsonFile
  static async writeJsonFile(path ,data) {
    try {
      await fs.promises.writeFile(path, JSON.stringify(data, null, 2))
    } 
    catch (error) {
      console.error('Error writing JSON file:', error)
      throw error
    }
  }
 }

module.exports = ClientModel
