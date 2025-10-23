const fs = require('fs')
const path = require('path')

const jsonFilePath = path.resolve(__dirname, './users.json')

class UsersModel {
  static async getAll() {
    let jsonData = await this.readJsonFile()
    return jsonData
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

module.exports = UsersModel
