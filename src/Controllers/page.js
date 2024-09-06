const PageModel = require("../Models/sql/page");
const { validateResellers_Form } = require('../Schemas/resellers_form')

// Memoria para almacenar las IPs y su conteo de envíos
let ipTracking = {};

// Reiniciar el contador cada día a medianoche
setInterval(() => {
  ipTracking = {};
}, 24 * 60 * 60 * 1000); // 24 horas en milisegundos

class PageController {  
  // Get all data
  static async getResellersData (req, res) {
    try {
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar'];
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      const { id, name } = req.query;
      const data = await PageModel.getResellersData({ id, name });

      res.json(data);
    } 
    catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Crear nueva data con límite diario por IP
  static async saveResellersData(req, res) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Obtener la IP del cliente
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const cleanIp = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

    // Limitar a 5 envíos por día por IP
    if (!ipTracking[cleanIp]) {
      ipTracking[cleanIp] = { count: 0, lastAccess: new Date() };
    }

    if (ipTracking[cleanIp].count >= 5) {
      return res.status(429).json({ error: 'Has excedido el límite diario de envíos. Inténtalo de nuevo mañana.' });
    }

    try {
      // Validar los datos
      const data = req.body;
      const result = validateResellers_Form(data);
      if (result.error) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      // Agregar los datos usando el modelo
      const addedData = await PageModel.saveResellersData({ input: data }, cleanIp);
      if (!addedData) {
        return res.status(409).json({ error: 'La información ya está en el sistema.' });
      }

      // Incrementar el contador de la IP
      ipTracking[cleanIp].count += 1;

      return res.status(201).json({ message: 'Información cargada correctamente.' });
    } catch (e) {
      console.log('Error al cargar nueva información: ', e);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }

  static async getIp(req, res) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Eliminar el prefijo IPv6 si está presente
    const cleanIp = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;
  
    console.log('Client IP:', cleanIp);
  
    // Aquí puedes continuar con tu lógica, por ejemplo, guardar la IP en la base de datos
    res.status(200).json({ message: 'IP recibida', ip: cleanIp });
  }

  static async checkResellerData(req, res) {
    try {
      const { id } = req.params
      const result = await PageModel.checkResellerData({ id });

      if (!result) {
        return res.status(409).json({ error: 'Error al marcar vista' });
      }
  
      return res.status(200).json({ success: 'Vista marcada correctamente' });
    } 
    catch (error) {
      console.error('Error al marcar vista:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = PageController

