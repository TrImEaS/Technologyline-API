const { ADMINPool } = require('./config')
const fs = require('fs')
const path = require('path')

const clientPath = path.resolve(__dirname, '../../Data/clients.json')
const statisticsPath = path.resolve(__dirname, '../../Data/statistics.json')

class ClientModel {
  static async getAll ({ id }) {
    const jsonData = await this.readJsonFile(clientPath)

    if (id) {
      return jsonData.find(data => parseInt(data.id) === parseInt(id))
    }

    return jsonData
  }

  static async addClient ({ input }) {
    try {
      const [exists] = await ADMINPool.query('SELECT fullname from client_ecommerce WHERE email = ?', [input.email])
      if (exists.length > 0) {
        return false
      }

      const [results] = await ADMINPool.query(
        'INSERT INTO `client_ecommerce`(`fullname`, `nickname`, `email`, `dni`, `address`, `password`) VALUES (?, ?, ?, ?, ?, ?)',
        [input.fullname, input.nickname, input.email, input.dni, input.address, input.password])
      const data = results

      return data
    } catch (error) {
      console.error('Error fetching resellers form_data:', error)
      throw error
    }
  }

  static async getNextId () {
    const jsonData = await this.readJsonFile(clientPath)

    // Ordenar los datos por ID en orden descendente
    jsonData.sort((a, b) => b.id - a.id)

    // Obtener el primer elemento, que será el último ID
    const lastData = jsonData[0]

    // Si no hay datos, comenzar desde 1
    const nextId = lastData ? lastData.id + 1 : 1

    return nextId
  }

  static async addSubscriber ({ input }) {
    try {
      const jsonData = await this.readJsonFile(clientPath)

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
    } catch (error) {
      console.error('Error pushing email:', error)
      throw error
    }
  }

  static async getPageViews () {
    const jsonData = await this.readJsonFile(statisticsPath)
    return jsonData.views
  }

  static async deleteSubscriptor ({ id }) {
    try {
      const jsonData = await this.readJsonFile(clientPath)

      // Filtrar los datos para eliminar el cliente con el ID especificado
      const updatedData = jsonData.filter(data => parseInt(data.id) !== parseInt(id))

      // Verificar si se eliminó algún cliente
      if (jsonData.length === updatedData.length) {
        // No se encontró ningún cliente con el ID proporcionado
        console.log(`Client with ID ${id} not found.`)
        return false
      }

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(clientPath, updatedData)

      console.log(`Client with ID ${id} deleted successfully.`)
      return true
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  // --> --- --- --- --- --- --- --- --- <--//
  static async readJsonFile (path) {
    try {
      const rawData = await fs.promises.readFile(path)
      return JSON.parse(rawData)
    } catch (error) {
      console.error('Error reading JSON file:', error)
      return []
    }
  }

  static async writeJsonFile (path, data) {
    try {
      await fs.promises.writeFile(path, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error writing JSON file:', error)
      throw error
    }
  }
}

module.exports = ClientModel
