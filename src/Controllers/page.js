const path = require('path')
const fs = require('fs');
const PageModel = require("../Models/sql/page");
const { validateResellers_Form } = require('../Schemas/resellers_form')
const nodemailer = require('nodemailer');

let ipTracking = {};

setInterval(() => {
  ipTracking = {};
}, 24 * 60 * 60 * 1000); 

const ipOrdersFile = path.join(__dirname, '../Data/ip_orders.json');

class PageController {  
  static async getResellersData (req, res) {
    try {
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

  static async getOrderMovement(req, res) {
    try {
      const movement = await PageModel.getOrderMovement()
      if(movement)
        return res.status(200).json(movement)

      res.status(404).json({ message: 'Error to get movement' });
    } 
    catch (error) {
      console.error('Error getting movement:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async setOrderMovement(req, res) {
    try {
      const movement = await PageModel.setOrderMovement(); 
  
      if (movement) {
        return res.status(200).json({ movement: movement.movement });
      }
  
      res.status(400).json({ message: 'Failed to update movement' });
    } 
    catch (error) {
      console.error('Error en setOrderMovement (Controlador):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async sendOrderEmail(req, res) {
    try {
      const clientIp = req.ip; 
      const now = Date.now();
      const oneHourAgo = now - 3600000;
      const ALLOWED_IP = "190.245.167.220"; 
  
      // Leer archivo de registros de IPs
      let ipOrders = {};
      if (fs.existsSync(ipOrdersFile)) {
        const rawData = fs.readFileSync(ipOrdersFile, 'utf-8');
        ipOrders = rawData ? JSON.parse(rawData) : {};
      }
  
      if (clientIp !== ALLOWED_IP) {
        if (!ipOrders[clientIp]) ipOrders[clientIp] = [];
        ipOrders[clientIp] = ipOrders[clientIp].filter(timestamp => timestamp > oneHourAgo);
  
        // Verificar si superó el límite de 3 pedidos por hora
        if (ipOrders[clientIp].length >= 3) {
          return res.status(403).json({ error: 'Excedió el límite de pedidos por hora, intente más tarde!' });
        }
  
        ipOrders[clientIp].push(now);
        fs.writeFileSync(ipOrdersFile, JSON.stringify(ipOrders, null, 2));
      } 
      else {
        console.log(`La IP ${clientIp} está exenta del límite de pedidos.`);
      }
  
      const { datos_de_orden, mails } = req.body;

      const transporter = nodemailer.createTransport({
        host: 'mail.real-color.com.ar',
        port: 587,
        secure: false,
        auth: {
          user: 'subsistemas@real-color.com.ar',
          pass: 'FacuFacu9090'
        }
      });

      const mailOptions = {
        from: '"Real Color" <subsistemas@real-color.com.ar>',
        to: mails.join(','),
        subject: `¡Nueva venta registrada - Pedido Web - ${datos_de_orden.movimiento_numero}!`,
        html: `
          <style>
            .modal-content {
              font-family: 'Arial', sans-serif;
              color: #333;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .modal-content h2 {
              color: #2c3e50;
              border-bottom: 2px solid #ecf0f1;
              padding-bottom: 10px;
            }
            .modal-content h3 {
              margin-top: 20px;
              color: #2980b9;
            }
            .modal-content p {
              line-height: 1.6;
              margin: 5px 0;
            }
            .modal-content ul {
              list-style: none;
              padding: 0;
            }
            .modal-content li {
              background: #ecf0f1;
              margin-bottom: 10px;
              padding: 10px;
              border-radius: 5px;
            }
            .modal-content strong {
              color: #34495e;
            }
          </style>
        
          <div class="modal-content">
            <h2>Detalles de la Orden</h2>
            <p><strong>Número de Movimiento:</strong> ${datos_de_orden.movimiento_numero}</p>
            
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${datos_de_orden.datos_cliente.nombre_completo}</p>
            <p><strong>DNI:</strong> ${datos_de_orden.datos_cliente.dni}</p>
            <p><strong>Dirección:</strong> ${datos_de_orden.datos_cliente.direccion}</p>
            <p><strong>CP:</strong> ${datos_de_orden.datos_cliente.cp}</p>
            <p><strong>Celular:</strong> ${datos_de_orden.datos_cliente.celular}</p>
            
            <h3>Productos</h3>
            <ul>
              ${datos_de_orden.productos.map(p => `
                <li>
                  <p><strong>SKU:</strong> ${p.sku}</p>
                  <p><strong>Descripción:</strong> ${p.descripcion}</p>
                  <p><strong>Precio:</strong> $${p.precio}</p>
                  <p><strong>Cantidad:</strong> ${p.cantidad_seleccionada}</p>
                </li>
              `).join('')}
            </ul>
            
            <h3>Opción de Entrega</h3>
            <p><strong>Retira en Local:</strong> ${datos_de_orden.opcion_de_entrega.retira_en_local}</p>
            <p><strong>Dirección:</strong> ${datos_de_orden.opcion_de_entrega.direccion}</p>
            <p><strong>CP:</strong> ${datos_de_orden.opcion_de_entrega.cp}</p>
            
            <h3>Forma de Pago</h3>
            <p><strong>Abona en:</strong> ${datos_de_orden.abona_en}</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado con éxito' });
    } 
    catch (error) {
      console.error('Error enviando el correo:', error);
      res.status(500).json({ error: 'No se pudo enviar el correo' });
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

  static async updateBannerPosition(req, res) {
    const { id, newId, name } = req.body;
  
    if (!id || !newId || !name) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }
  
    try {
      await PageModel.updateBannerPosition({ id, newId, name });
      res.json({ status: 'success', message: 'Posición actualizada correctamente' });
    } 
    catch (error) {
      console.error('Error al actualizar posición:', error);
      res.status(500).json({ status: 'error', message: 'Error al actualizar posición' });
    }
  }

  static async uploadImage(req, res) {
    const { id, name, to } = req.body;

    const imageFile = req.file; 
    if (!imageFile) 
      return res.status(400).json({ status: 'error', message: 'Archivo de imagen no recibido' });
  
    console.log(`Datos recibidos: { id: ${id}, name: ${name}, imageSize: ${imageFile.size}, to: ${to} }`);
  
    if (!id || !name || !imageFile) {
      console.log('Error: Datos incompletos');
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }
  
    try {
      const fileUrl = `https://technologyline.com.ar/banners-images/${imageFile.filename}`; // La URL del archivo subido
      
      console.log(`Archivo guardado exitosamente en: ${imageFile.path}`);
  
      // Actualizar la base de datos
      await PageModel.updateImagePath({ id, fileUrl, to });
      console.log(`Base de datos actualizada con URL: ${fileUrl}`);
  
      res.json({ status: 'success', message: 'Imagen subida correctamente' });
    } 
    catch (error) {
      console.log(`Error al subir la imagen: ${error.message}`);
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

  static async uploadExcel(req, res) {
    try {
      if (!req.file) 
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
  
      const filePath = path.resolve(__dirname, '../Data', req.file.filename);
  
      if (!fs.existsSync(filePath)) {
        return res.status(500).json({ error: 'Error al procesar el archivo, no se encontró en el servidor' });
      }
  
      res.json({
        message: 'Archivo subido correctamente',
        fileName: req.file.filename,
        filePath,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al subir el archivo', message: error.message });
    }
  }

  static async getCategoriesForCarrousel(req, res) {
    try {
      const data = await PageModel.getCategoriesForCarrousel();

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
}

module.exports = PageController

