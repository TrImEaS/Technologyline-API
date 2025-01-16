const path = require('path')
const fs = require('fs');
const PageModel = require("../Models/sql/page");
const { validateResellers_Form } = require('../Schemas/resellers_form')

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:8080', 
  'https://www.technologyline.com.ar', 
  'https://www.line-technology.com.ar', 
  'https://www.real-color.com.ar',
  'https://real-color.com.ar',
  'http://www.real-color.com.ar',
  'http://real-color.com.ar',
];

let ipTracking = {};

setInterval(() => {
  ipTracking = {};
}, 24 * 60 * 60 * 1000); 

class PageController {  
  static async getResellersData (req, res) {
    try {
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      const { id, name } = req.query;
      const data = await PageModel.getResellersData({ id, name });
      
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Expires', '0');
      res.setHeader('Pragma', 'no-cache');
      
      res.json(data);
    } 
    catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async saveResellersData(req, res) {
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

  static async getBanners(req, res) {
    try {
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      const data = await PageModel.getBanners();

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Expires', '0');
      res.setHeader('Pragma', 'no-cache');
      
      res.json(data);
    } 
    catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async uploadImage(req, res) {
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  
    logToFile(`Comienza update`);
    
    const { id, name, to } = req.body; // Obtiene id, name y to del cuerpo de la solicitud
    const imageFile = req.file; // Obtiene el archivo subido
  
    // Función para escribir en log.txt
    const logPath = path.join(__dirname, 'log.txt');
    const logToFile = (message) => {
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
    };
  
    logToFile(`Datos recibidos: { id: ${id}, name: ${name}, imageSize: ${imageFile.size}, to: ${to} }`);
  
    if (!id || !name || !imageFile) {
      logToFile('Error: Datos incompletos');
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }
  
    try {
      const fileUrl = `https://technologyline.com.ar/banners-images/${imageFile.filename}`; // La URL del archivo subido
      
      logToFile(`Archivo guardado exitosamente en: ${imageFile.path}`);
  
      // Actualizar la base de datos
      await PageModel.updateImagePath({ id, fileUrl, to });
      logToFile(`Base de datos actualizada con URL: ${fileUrl}`);
  
      res.json({ status: 'success', message: 'Imagen subida correctamente' });
    } catch (error) {
      logToFile(`Error al subir la imagen: ${error.message}`);
      res.status(500).json({ status: 'error', message: 'Error al subir la imagen' });
    }
  }
  
  static async deleteImage(req, res) {
    const { id, name } = req.body;
  
    if (!id || !name) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }
  
    try {
      // Ruta absoluta del directorio
      const directoryPath = '/home/realcolorweb/public_html/technologyline.com.ar/banners-images/';
      
      // Verifica si el directorio existe
      if (!fs.existsSync(directoryPath)) {
        console.error('Directorio no encontrado:', directoryPath);
        return res.status(500).json({ status: 'error', message: 'Directorio no encontrado' });
      }
  
      // Patrón de archivo
      const filePattern = new RegExp(`${name.toLowerCase()}_${id}_.*\.jpg`);
      const files = fs.readdirSync(directoryPath).filter(file => filePattern.test(file));
  
      // Eliminar los archivos encontrados
      for (const file of files) {
        console.log('Eliminando archivo:', path.join(directoryPath, file));
        fs.unlinkSync(path.join(directoryPath, file));
      }
  
      // Actualizar la base de datos
      await PageModel.clearImagePath({ id });
  
      res.json({ status: 'success', message: 'Imagen eliminada correctamente' });
    } 
    catch (error) {
      console.error('Error al eliminar la imagen:', error);
      res.status(500).json({ status: 'error', message: 'Error al eliminar la imagen' });
    }
  }

}

module.exports = PageController

