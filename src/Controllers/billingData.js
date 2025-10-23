// const { validatePartialBillingData, validateBillingData } = require('../Schemas/billingData.js')
const BillingDataModel = require('../Models/json/billingData.js')
const path = require('path')
const fs = require('fs')

class BillingDataController {
  // Get all billing data
  static async getAll (req, res) {
    try {
      const { company, client, numberBill, user, verificationNumber, createDate } = req.query
      const data = await BillingDataModel.getAll({ company, client, numberBill, user, verificationNumber, createDate })
      res.json(data)
    } catch (error) {
      console.error('Error retrieving data by date:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Get billing data by id
  static async getById (req, res) {
    try {
      const { id } = req.params
      const data = await BillingDataModel.getById(parseInt(id))
      if (data) return res.json(data)

      res.status(404).json({ message: 'Billing data not found' })
    } catch (error) {
      console.error('Error retrieving data by date:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Create an billing data
  static async create (req, res) {
    const newId = await BillingDataModel.getNextId()

    try {
      const inputData = {
        id: newId,
        user: req.body.user,
        createDate: req.body.createDate,
        company: req.body.company,
        client: parseInt(req.body.client),
        checkDate: '0',
        numberBill: parseInt(req.body.numberBill),
        verificationNumber: parseInt(req.body.verificationNumber),
        link: req.body.link
      }

      // Validacion de datos
      // const result = validateBillingData(inputData)
      // if (result.error) {
      //   return res.status(422).json({ error: JSON.parse(result.error.message) })
      // }

      // Validar si los datos ya existen sino subir los datos
      const existingData = await BillingDataModel.create({ input: inputData })
      if (!existingData) {
        return res.status(409).json({ error: 'El numero de factura ya esta en uso para este cliente' })
      }

      // Verificar que los valores del html no esten vacios
      const htmlContent = req.body.htmlContent
      const fileName = req.body.fileName

      if (htmlContent === undefined || fileName === undefined) {
        return res.status(400).json({ error: 'El contenido html y el nombre del mismo no pueden ser undefined.' })
      }

      // Crear archivo html
      //  const saveFolderPath = path.join(__dirname, '../../Files/Codes') //dev mode
      const saveFolderPath = path.join('/home/realcolorweb/public_html/technologyline.com.ar/admin/QRGen-App/api') // production mode

      // Verificar si la carpeta de destino existe
      if (!fs.existsSync(saveFolderPath)) {
        fs.mkdirSync(saveFolderPath, { recursive: true })
      }

      // Ruta completa del archivo a guardar
      const savePath = path.join(saveFolderPath, fileName)

      fs.writeFile(savePath, htmlContent, (err) => {
        if (err) {
          console.error('Error al guardar el archivo HTML:', err)
          res.status(500).json({ message: `Error al guardar el archivo HTML ${htmlContent} + ${fileName} + ${__dirname}` })
        } else {
          console.log('Archivo HTML guardado correctamente en:', savePath)
        }
      })

      return res.status(201).json({ message: 'Billing data created correctly' })
    } catch (e) {
      console.log('Error updating billing data: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Edit billing data by id
  static async update (req, res) {
    try {
      const result = req.body

      // if (!result.success) { return res.status(400).json({ error: JSON.parse(result.error.message) }) }

      const { id } = req.params

      const updatedata = await BillingDataModel.update({ id, input: result.data })

      return res.json(updatedata)
    } catch (e) {
      console.log('Error updating billing data: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /// / Faltan estos
  // Get create date by date
  // static async getCreateDateByDate(req,res) {
  //   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
  //   const origin = req.headers.origin
  //   if (allowedOrigins.includes(origin)) {
  //     res.setHeader('Access-Control-Allow-Origin', origin)
  //   }

  //   const { date } = req.params;

  //   try {
  //     const data = await BillingDataModel.getCreateDateByDate(date);
  //     res.json(data);
  //   }
  //   catch (error) {
  //     console.error('Error retrieving data by date:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  // // Get create date by time
  // static async getCreateDateByTime(req,res) {
  //   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
  //   const origin = req.headers.origin
  //   if (allowedOrigins.includes(origin)) {
  //     res.setHeader('Access-Control-Allow-Origin', origin)
  //   }

  //   const { time } = req.params;

  //   try {
  //     const data = await BillingDataModel.getCreateDateByTime(time);
  //     return res.json(data);
  //   }
  //   catch (error) {
  //     console.error('Error retrieving data by time:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  // // Get check date by date
  // static async getCheckDateByDate(req,res) {
  //   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
  //   const origin = req.headers.origin
  //   if (allowedOrigins.includes(origin)) {
  //     res.setHeader('Access-Control-Allow-Origin', origin)
  //   }

  //   const { date } = req.params;

  //   try {
  //     const data = await BillingDataModel.getCheckDateByDate(date);
  //     res.json(data);
  //   }
  //   catch (error) {
  //     console.error('Error retrieving data by date:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  // // Get check date by time
  // static async getCheckDateByTime(req,res) {
  //   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
  //   const origin = req.headers.origin
  //   if (allowedOrigins.includes(origin)) {
  //     res.setHeader('Access-Control-Allow-Origin', origin)
  //   }

  //   const { time } = req.params;

  //   try {
  //     const data = await BillingDataModel.getCheckDateByTime(time);
  //     return res.json(data);
  //   }
  //   catch (error) {
  //     console.error('Error retrieving data by time:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }
}

module.exports = BillingDataController
