const fs = require('fs')
const path = require('path')

const jsonFilePath = path.resolve(__dirname, './billingData.json')

class BillingDataModel {
  //Get all data
  static async getAll({ company, client, numberBill, user, verificationNumber, createDate }) {
    let jsonData = await this.readJsonFile()

    if (company) {
      company = company.replace(/\s/g, '')
      return jsonData.filter(data => data.company.trim() === company.toLowerCase())
    } 
    
    if (client) {
      return jsonData.filter(data => data.client === parseInt(client))
    } 
    
    if (numberBill) {
      return jsonData.filter(data => data.numberBill === parseInt(numberBill))
    } 
    
    if (user) {
      user = user.replace(/\s/g, '')
      return jsonData.filter(data => data.user.trim() === user.toLowerCase().trim())
    }
    
    if (verificationNumber) {
      return jsonData.filter(data => parseInt(data.verificationNumber) === parseInt(verificationNumber))
    }

    if (createDate) {
      return jsonData.filter(data => data.createDate.includes(createDate))
    }

    return jsonData
  }

  //Get data by id
  static async getById(id) {
    let jsonData = await this.readJsonFile()
    return jsonData.filter(data => parseInt(data.id) === parseInt(id) )
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

      // Verificar si ya existe un registro con el mismo client y numberBill
      const existingData = jsonData.find(data =>
        data.client === parseInt(input.client) && 
        data.numberBill === parseInt(input.numberBill) &&
        data.company === input.company
      )

      if (existingData) {
        return false
      }

      // Agregar el nuevo dato al array
      jsonData.push(input)

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(jsonData)

      console.log('New billing data created')
      return input
    } 
    catch (error) {
      console.error('Error creating billing data:', error)
      throw error
    }
  }

  //Edit by id (parcial)
  static async update({ id, input }) {
    try {
      let jsonData = await this.readJsonFile()

      const index = jsonData.findIndex(data => parseInt(data.id) === parseInt(id))

      if (index === -1) {
        return 'Error: Id indicado no encontrado'
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
      console.error('Error updating billing data:', error)
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


module.exports = BillingDataModel
