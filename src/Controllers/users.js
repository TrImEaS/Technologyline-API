const UsersModel = require('../Models/json/users.js')

class UsersController {
  // Get all billing data
  static async getAll (req, res) {
    try {
      const data = await UsersModel.getAll()
      res.json(data)
    } catch (error) {
      console.error('Error retrieving data by date:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = UsersController
