const path = require('path')
const fs = require('fs')
const PageModel = require('../Models/sql/page/index.js')
const { validateResellers_Form } = require('../Schemas/resellers_form')
const nodemailer = require('nodemailer')
const getOrderNotificationTemplate = require('../Utils/EmailTemplates/orderNotification')
const getOrderConfirmationTemplate = require('../Utils/EmailTemplates/orderConfirmation')
const jwt = require('jsonwebtoken')

const SECRET_KEY = 'trimeasdacarry'

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE_BRANDS = isDev
  ? path.join(__dirname, '../FakeStatic/products-images')
  : '/home/technologyline/public_html/banners-images/Assets/Brands'

let ipTracking = {}

setInterval(() => { ipTracking = {} }, 24 * 60 * 60 * 1000)

// const ipOrdersFile = path.join(__dirname, '../Data/ip_orders.json');

class PageController {
  static async addBrandForCarousel (req, res) {
    try {
      const { id_brand, image_path, active } = req.body
      if (!id_brand || !image_path) {
        return res.status(400).json({ error: 'Faltan datos requeridos' })
      }
      // verificar si la ruta de la imagen es relativa o absoluta
      let finalImagePath = image_path
      if (!image_path.startsWith('/') && !image_path.includes('://')) {
        finalImagePath = STATIC_BASE_BRANDS + '/' + image_path
      }
      const newBrand = await PageModel.addBrandForCarousel({ id_brand, image_path: finalImagePath, active })
      return res.status(200).json(newBrand)
    } catch (err) {
      return res.status(500).json({ error: 'Error al agregar la marca al carousel' })
    }
  }

  static async updateBrandsForCarousel (req, res) {
    try {
      const data = await PageModel.updateBrandsForCarousel({ input: req.body })
      res.json(data)
    } catch (error) {
      console.error('Error actualizando brands_carousel:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async updateBannerOrder (req, res) {
    const { banners } = req.body
    if (!Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({ error: 'No se recibieron banners para actualizar.' })
    }
    try {
      for (const banner of banners) {
        if (!banner.id || typeof banner.position !== 'number') continue
        await PageModel.updateBannerPosition({ id: banner.id, position: banner.position })
        console.log(`Banner actualizado: id=${banner.id}, nueva posición=${banner.position}`)
      }
      res.json({ status: 'success' })
    } catch (error) {
      console.error('Error actualizando el orden de los banners:', error)
      res.status(500).json({ error: 'Error actualizando el orden de los banners.' })
    }
  }

  static async getResellersData (req, res) {
    try {
      const { id, name } = req.query
      const data = await PageModel.getResellersData({ id, name })

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      res.json(data)
    } catch (error) {
      console.error('Error retrieving products:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getUserData (req, res) {
    const { email } = req.query
    const data = await PageModel.gerUserData({ email })

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Expires', '0')
    res.setHeader('Pragma', 'no-cache')

    res.json(data)
  }

  static async changeUserData (req, res) {
    try {
      const updatedUser = await PageModel.changeUserData({
        input: req.body,
        email: req.body.email
      })

      if (updatedUser) {
        return res.status(200).json({ message: 'Datos del usuario actualizados correctamente' })
      }

      res.status(400).json({ message: 'No se pudieron actualizar los datos del usuario' })
    } catch (error) {
      console.error('Error al actualizar los datos del usuario:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async changeUserPassword (req, res) {
    try {
      const updatedUser = await PageModel.changeUserPassword({
        input: req.body,
        email: req.body.email
      })

      if (updatedUser === 1) { return res.status(400).json({ message: 'La contraseña actual es incorrecta' }) }

      if (updatedUser === 2) { return res.status(404).json({ message: 'Usuario no encontrado' }) }

      if (updatedUser) { return res.status(200).json({ message: 'Contraseña actualizada correctamente' }) }

      res.status(400).json({ message: 'No se pudo actualizar la contraseña' })
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async loginUser (req, res) {
    try {
      const { email, password } = req.body
      const user = await PageModel.loginUser({ email, password })

      if (user) {
        const token = jwt.sign(
          { id: +user.id || user, email },
          SECRET_KEY,
          { expiresIn: '7d' }
        )

        res.cookie('email', email, { maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.status(200).json({ login: true, token, id: +user.id })
      }

      res.status(400).json({ message: 'Failed to login user' })
    } catch (error) {
      console.error('Error al logearse:', error)
      res.status(500).json({ error: `Internal server error ${error.message}` })
    }
  }

  static async loginGoogle (req, res) {
    try {
      const { email, name, sub } = req.body
      const user = await PageModel.loginGoogle({ email, name, sub })

      if (user) {
        const token = jwt.sign(
          { id: +user.id || user, email },
          SECRET_KEY,
          { expiresIn: '7d' }
        )

        res.cookie('email', email, {
          maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ login: true, token, id: +user.id })
      }

      res.status(400).json({ message: 'Failed to login user with Google' })
    } catch (error) {
      console.error('Error al logearse con Google:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async registerUser (req, res) {
    try {
      const {
        name,
        username,
        dni,
        address,
        location,
        postal_code,
        phone,
        email,
        password
      } = req.body

      const user = await PageModel.registerUser({ name, username, dni, address, location, postal_code, phone, email, password })

      if (user) {
        const token = jwt.sign(
          { id: +user.id || user, email },
          SECRET_KEY,
          { expiresIn: '7d' }
        )

        res.cookie('email', email, {
          maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ login: true, token, id: +user.id })
      }

      res.status(400).json({ message: user.error })
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        return res.status(409).json({ message: 'El correo ya está registrado' })
      }

      console.error('Error al registrarse:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getClientBill (req, res) {
    const { id, movement, invoice_number } = req.query
    const filePath = `/home/technologyline/public_html/bills/client_${id}/fc-${invoice_number}_movement-${movement}.pdf`
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Factura no encontrada' })
    }
    res.status(200).json({ link: `https://technologyline.com.ar/bills/client_${id}/fc-${invoice_number}_movement-${movement}.pdf` })
  }

  static async deleteUser (req, res) {
    res.json({ message: 'deleteUser' })
  }

  static async saveResellersData (req, res) {
    // Obtener la IP del cliente
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const cleanIp = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp

    // Limitar a 5 envíos por día por IP
    if (!ipTracking[cleanIp]) {
      ipTracking[cleanIp] = { count: 0, lastAccess: new Date() }
    }

    if (ipTracking[cleanIp].count >= 5) {
      return res.status(429).json({ error: 'Has excedido el límite diario de envíos. Inténtalo de nuevo mañana.' })
    }

    try {
      // Validar los datos
      const data = req.body
      const result = validateResellers_Form(data)
      if (result.error) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      // Agregar los datos usando el modelo
      const addedData = await PageModel.saveResellersData({ input: data }, cleanIp)
      if (!addedData) {
        return res.status(409).json({ error: 'La información ya está en el sistema.' })
      }

      // Incrementar el contador de la IP
      ipTracking[cleanIp].count += 1

      return res.status(201).json({ message: 'Información cargada correctamente.' })
    } catch (e) {
      console.log('Error al cargar nueva información: ', e)
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  static async getOrderMovement (req, res) {
    try {
      const movement = await PageModel.getOrderMovement()
      if (movement) { return res.status(200).json(movement) }

      res.status(404).json({ message: 'Error to get movement' })
    } catch (error) {
      console.error('Error getting movement:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async setOrderMovement (req, res) {
    try {
      const movement = await PageModel.setOrderMovement()

      if (movement) {
        return res.status(200).json({ movement: movement.movement })
      }

      res.status(400).json({ message: 'Failed to update movement' })
    } catch (error) {
      console.error('Error en setOrderMovement (Controlador):', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async sendOrderEmail (req, res) {
    try {
      // const clientIp = req.ip;
      // const now = Date.now();
      // const oneHourAgo = now - 3600000;
      // const ALLOWED_IP = "190.245.167.220";

      // Leer archivo de registros de IPs
      // let ipOrders = {};
      // if (fs.existsSync(ipOrdersFile)) {
      //   const rawData = fs.readFileSync(ipOrdersFile, 'utf-8');
      //   ipOrders = rawData ? JSON.parse(rawData) : {};
      // }

      // if (clientIp !== ALLOWED_IP || clientIp === "::ffff:127.0.0.1") {
      //   if (!ipOrders[clientIp]) ipOrders[clientIp] = [];
      //   ipOrders[clientIp] = ipOrders[clientIp].filter(timestamp => timestamp > oneHourAgo);

      //   // Verificar si superó el límite de 3 pedidos por hora
      //   if (ipOrders[clientIp].length >= 3) {
      //     return res.status(403).json({ error: 'Excedió el límite de pedidos por hora, intente más tarde!' });
      //   }

      //   ipOrders[clientIp].push(now);
      //   fs.writeFileSync(ipOrdersFile, JSON.stringify(ipOrders, null, 2));
      // }
      // else {
      //   console.log(`La IP ${clientIp} está exenta del límite de pedidos.`);
      // }

      const { datos_de_orden, mails } = req.body

      const transporter = nodemailer.createTransport({
        host: 'mail.real-color.com.ar',
        port: 587,
        secure: false,
        auth: {
          user: 'subsistemas@real-color.com.ar',
          pass: 'FacuFacu9090'
        }
      })

      const mailOptions = {
        from: `"${datos_de_orden.company}" <subsistemas@real-color.com.ar>`,
        to: mails.join(','),
        subject: `¡Nuevo pedido registrado - Pedido Web de ${datos_de_orden.company} - ${datos_de_orden.movimiento_numero}!`,
        html: getOrderNotificationTemplate(datos_de_orden)
      }

      const mailToClient = {
        from: `"${datos_de_orden.company}" <subsistemas@real-color.com.ar>`,
        to: datos_de_orden.datos_cliente.email,
        // to: mails.join(','),
        subject: `Recibimos tu pedido #${datos_de_orden.movimiento_numero} - ${datos_de_orden.company}`,
        html: getOrderConfirmationTemplate(datos_de_orden)
      }

      const result = await PageModel.saveOrderData({ input: req.body.datos_de_orden })
      if (!result) { return res.status(400).json({ error: 'Error al guardar los datos del pedido' }) }

      // Enviar los correos
      await transporter.sendMail(mailOptions)
      await transporter.sendMail(mailToClient)

      res.status(200).json({ message: 'Correo enviado con éxito' })
    } catch (error) {
      console.error('Error enviando el correo:', error)
      res.status(500).json({ error: 'No se pudo enviar el correo' })
    }
  }

  static async getClientOrders (req, res) {
    try {
      const { email, id, movement } = req.query
      const movements = await PageModel.getClientOrders({ email, id, movement })
      if (movements) { return res.status(200).json(movements) }

      res.status(404).json({ message: 'Error to get movement' })
    } catch (error) {
      console.error('Error getting movement:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getOrdersStates (req, res) {
    try {
      const states = await PageModel.getOrdersStates()
      if (states) { return res.status(200).json(states) }

      res.status(404).json({ message: 'Error to get states' })
    } catch (error) {
      console.error('Error getting movement:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getIp (req, res) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    // Eliminar el prefijo IPv6 si está presente
    const cleanIp = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp

    console.log('Client IP:', cleanIp)

    // Aquí puedes continuar con tu lógica, por ejemplo, guardar la IP en la base de datos
    res.status(200).json({ message: 'IP recibida', ip: cleanIp })
  }

  static async checkResellerData (req, res) {
    try {
      const { id } = req.params
      const result = await PageModel.checkResellerData({ id })

      if (!result) {
        return res.status(409).json({ error: 'Error al marcar vista' })
      }

      return res.status(200).json({ success: 'Vista marcada correctamente' })
    } catch (error) {
      console.error('Error al marcar vista:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async getBanners (req, res) {
    try {
      const data = await PageModel.getBanners()

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      res.json(data)
    } catch (error) {
      console.error('Error retrieving products:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async updateBannerPosition (req, res) {
    const { id, newId, name } = req.body

    if (!id || !newId || !name) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' })
    }

    try {
      await PageModel.updateBannerPosition({ id, newId, name })
      res.json({ status: 'success', message: 'Posición actualizada correctamente' })
    } catch (error) {
      console.error('Error al actualizar posición:', error)
      res.status(500).json({ status: 'error', message: 'Error al actualizar posición' })
    }
  }

  static async uploadImage (req, res) {
    const { id, name, to } = req.body

    const imageFile = req.file
    if (!imageFile) { return res.status(400).json({ status: 'error', message: 'Archivo de imagen no recibido' }) }

    console.log(`Datos recibidos: { id: ${id}, name: ${name}, imageSize: ${imageFile.size}, to: ${to} }`)

    if (!id || !name || !imageFile) {
      console.log('Error: Datos incompletos')
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' })
    }

    try {
      const fileUrl = `https://technologyline.com.ar/banners-images/${imageFile.filename}` // La URL del archivo subido

      console.log(`Archivo guardado exitosamente en: ${imageFile.path}`)

      // Actualizar la base de datos
      await PageModel.updateImagePath({ id, fileUrl, to })
      console.log(`Base de datos actualizada con URL: ${fileUrl}`)

      res.json({ status: 'success', message: 'Imagen subida correctamente' })
    } catch (error) {
      console.log(`Error al subir la imagen: ${error.message}`)
      res.status(500).json({ status: 'error', message: 'Error al subir la imagen' })
    }
  }

  static async deleteImage (req, res) {
    const { id, name } = req.body

    if (!id || !name) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' })
    }

    try {
      // Ruta absoluta del directorio
      const directoryPath = '/home/technologyline/public_html/banners-images/'

      // Verifica si el directorio existe
      if (!fs.existsSync(directoryPath)) {
        console.error('Directorio no encontrado:', directoryPath)
        return res.status(500).json({ status: 'error', message: 'Directorio no encontrado' })
      }

      // Patrón de archivo
      const filePattern = new RegExp(`${name.toLowerCase()}_${id}_.*.jpg`)
      const files = fs.readdirSync(directoryPath).filter(file => filePattern.test(file))

      // Eliminar los archivos encontrados
      for (const file of files) {
        console.log('Eliminando archivo:', path.join(directoryPath, file))
        fs.unlinkSync(path.join(directoryPath, file))
      }

      // Actualizar la base de datos
      await PageModel.clearImagePath({ id })

      res.json({ status: 'success', message: 'Imagen eliminada correctamente' })
    } catch (error) {
      console.error('Error al eliminar la imagen:', error)
      res.status(500).json({ status: 'error', message: 'Error al eliminar la imagen' })
    }
  }

  static async uploadExcel (req, res) {
    try {
      if (!req.file) { return res.status(400).json({ error: 'No se recibió ningún archivo' }) }

      const filePath = path.resolve(__dirname, '../Data', req.file.filename)

      if (!fs.existsSync(filePath)) {
        return res.status(500).json({ error: 'Error al procesar el archivo, no se encontró en el servidor' })
      }

      res.json({
        message: 'Archivo subido correctamente',
        fileName: req.file.filename,
        filePath
      })
    } catch (error) {
      res.status(500).json({ error: 'Error al subir el archivo', message: error.message })
    }
  }

  static async getCategoriesForCarrousel (req, res) {
    try {
      const data = await PageModel.getCategoriesForCarrousel()

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      res.json(data)
    } catch (error) {
      console.error('Error retrieving products:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getBrandsForCarousel (req, res) {
    try {
      const data = await PageModel.getBrandsForCarousel()

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      res.json(data)
    } catch (error) {
      console.error('Error retrieving products:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async updateCategoriesForCarrousel (req, res) {
    try {
      const data = await PageModel.updateCategoriesForCarrousel({ input: req.body })

      res.json(data)
    } catch (error) {
      console.error('Error retrieving products:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async uploadClientBill (req, res) {
    try {
      const { invoice_number, clientId, movement } = req.body
      console.log(req.body)
      await PageModel.setClientInvoice({
        clientId: parseInt(clientId),
        invoiceNumber: invoice_number,
        movement: parseInt(movement)
      })
      return res.status(200).json({ ok: true, message: 'Factura subida y DB actualizada' })
    } catch (err) {
      console.error('Error en uploadClientBill:', err)
      return res.status(500).json({ ok: false, error: 'Error interno al subir factura' })
    }
  }

  static async changeOrderState (req, res) {
    try {
      const { orderId, state, user, observations } = req.body

      if (!orderId || !state || !user) {
        return res.status(400).json({ error: 'OrderID, estado y usuario son requeridos' })
      }

      const updatedOrder = await PageModel.changeOrderState({ orderId, state, user, observations })
      if (updatedOrder) {
        return res.status(200).json({ message: 'Estado del pedido actualizado correctamente' })
      }

      res.status(404).json({ message: 'Pedido no encontrado' })
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

module.exports = PageController
