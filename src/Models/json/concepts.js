const fs = require('fs')
const path = require('path')

const jsonFilePath = path.resolve(__dirname, '../../Data/concepts.json')

class ConceptModel {
  // Get all concepts
  static async getAll ({ company, status }) {
    let concepts = await this.readJsonFile()

    if (company) {
      return concepts.filter( concept => concept.company &&
        concept.company.toLowerCase().trim().replace(/\s+/g, '') === company.toLowerCase().trim().replace(/\s+/g, '') )}
    
    if (status){
      return concepts.filter( concept => concept.status === status)
    }
    
    return concepts
  }

  // Get data by id
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


  // Create an concept
  static async create ({ input }) {
    try {
      let jsonData = await this.readJsonFile()

      // Verificar si ya existe un registro con el mismo client y numberBill
      const existingData = jsonData.find(data =>
        data.name.trim().toUpperCase() === input.name.trim().toUpperCase() &&
        data.type.trim().toUpperCase() === input.type.trim().toUpperCase()
      )

      if (existingData) {
        return 'Ya existe el concepto'
      }

      // Agregar el nuevo dato al array
      jsonData.push(input)

      // Escribir los datos actualizados en el archivo JSON
      await this.writeJsonFile(jsonData)

      console.log('New concept data created')
      return input
    } 
    catch (error) {
      console.error('Error creating concept:', error)
      throw error
    }
  }

  // Edit an concept with the docket
  static async update ({ id, input }) {
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
      console.error('Error updating concept:', error)
      throw error
    }
  }

  // Delete concept by id
  static async delete ({ id }) {
    try {
      let concepts = await this.readJsonFile()
      const conceptIndex = concepts.findIndex(concept => parseInt(concept.id) === parseInt(id))

      if (conceptIndex === -1){ 
        return false
      }
  
      concepts.splice(conceptIndex, 1)[0]
      await this.writeJsonFile(concepts);

      return `Concept deleted correctly!`
    } 
    catch (e) {
      console.error('Error updating concept:', error)
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

module.exports = ConceptModel;
