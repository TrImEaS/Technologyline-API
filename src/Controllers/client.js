const { validateEmail } = require ('../Schemas/email.js')
const ClientModel = require ('../Models/json/client.js')

class ClientController {  
  // Get all product
  static async getAll (req, res) {
    try {
      const { id } = req.query
      const clients = await ClientModel.getAll({ id })
      res.json(clients)
    }
    catch (error) {
      console.error('Error retrieving email', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getPageViews (req, res) {
    try {
      const views = await ClientModel.getPageViews()
      console.log(views)
      res.json({ views: views })
    }
    catch (error) {
      console.error('Error retrieving viwes', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  static async addSubscriber(req, res) {
    const newId = await ClientModel.getNextId()

    try {
      const inputData = {
        id: newId,
        email: req.body.email
      }
      
      //Validacion de datos
      const result = validateEmail(inputData)
      if (result.error){
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      //Validar si los datos ya existen sino subir los datos
      const existingData = await ClientModel.addSubscriber({ input: inputData })
      if (!existingData) {
        return res.status(409).json({ error: 'El producto ya se encuentra en el sistema!' })
      }

      return res.status(201).json({ message: 'Product created correctly'})
    } 
    catch (e) {
      console.log('Error to create new product: ', e)

      return res.status(500).json({ error: "Internal server error" });
    }
  }

}

module.exports = ClientController;
