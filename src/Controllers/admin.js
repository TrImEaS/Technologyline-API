const fs = require('fs')
const path = require('path')
const refreshDB = require('../Functions/refreshDB.js')

const usersFilePath = path.resolve(__dirname, '../Data/users.json')

class AdminController {
  static async refreshDB(req, res) {
    try {
      await refreshDB()
      return res.status(200).json({ message: 'Datos actualizados exitosamente' })
    } 
    catch (error) {
      console.error('Error al actualizar los datos:', error)
      return res.status(500).json({ message: 'Error al actualizar los datos' })
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body
      const usersData = await fs.promises.readFile(usersFilePath, 'utf8')
      const users = JSON.parse(usersData)
      const foundUser = users.find(user => user.username === username.toLowerCase() && user.password === password)
      if (foundUser) {
        return res.status(202).json({message: 'Logeado correctamente'})
      } else {
        return res.status(403).json({message: 'Error al logearse, intente de nuevo'})
      }
    } catch (error) {
      console.error('Error al leer el archivo de usuarios:', error)
      return res.status(500).json({error: 'Server error to login'})
    }
  }
}

module.exports = AdminController