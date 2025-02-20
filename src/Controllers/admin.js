const fs = require('fs')
const path = require('path')
const AdminModel = require('../Models/sql/admin.js')
const refreshDB = require('../Functions/refreshDB.js')
const refreshPrices = require('../Functions/refreshPrices.js')
const refreshImg = require('../Functions/refreshImg.js')


const usersFilePath = path.resolve(__dirname, '../Data/users.json')

class AdminController {
  static async refreshDB(req, res) {
    try {
      await refreshDB()
      return res.status(200).json({ message: 'Stock actualizado exitosamente' })
    } 
    catch (error) {
      console.error('❌ Error al actualizar los stock:', error);

      return res.status(500).json({
        message: `Error al actualizar los stock: ${error.message}`,
      });
    }
  }

  static async refreshPrices(req, res) {
    try {
      await refreshPrices()
      return res.status(200).json({ message: 'Precios actualizados exitosamente' })
    } 
    catch (error) {
      console.error('❌ Error al actualizar los precios:', error);

      return res.status(500).json({
        message: `Error al actualizar los precios: ${error.message}`,
      });
    }
  }

  static async refreshImg(req, res) {
    try {
      await refreshImg()
      return res.status(200).json({ message: 'Imagenes actualizadas exitosamente' })
    } 
    catch (error) {
      console.error('❌ Error al actualizar las imagenes:', error)

      return res.status(500).json({
        message: `Error al actualizar los precios: ${error.message}`,
      });
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

  static async getAllClients(req, res) {
    try {
      const { id } = req.query
      if(!id) { return }

      const result = await AdminModel.getAllClients({ id })

      if(!result) {
        return res.status(403).json({ message: 'Error al traer clientes' })
      }
      
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Expires', '0');
      res.setHeader('Pragma', 'no-cache');

      res.json(result)
    } 
    catch (error) {
      console.error('Error al actualizar los datos:', error)
      return res.status(500).json({ message: 'Error del servidor al traer clientes' })
    }
  }
}

module.exports = AdminController