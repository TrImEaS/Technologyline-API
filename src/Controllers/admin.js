const fs = require('fs')
const path = require('path')
const AdminModel = require('../Models/sql/admin.js')
const ClientModel = require('../Models/json/client.js')
const refreshDB = require('../Functions/refreshDB.js')
const refreshPrices = require('../Functions/refreshPrices.js')
const refreshImg = require('../Functions/refreshImg.js')
const XlsxPopulate = require('xlsx-populate')
const xlsx = require('xlsx')
const uuidv4 = require('uuid/v4')

const usersFilePath = path.resolve(__dirname, '../Data/users.json')

// Progreso de importación en memoria
const importProgress = {}

class AdminController {
  static async refreshDB (req, res) {
    try {
      await refreshDB()
      await refreshPrices()
      return res.status(200).json({ message: 'Stock actualizado exitosamente' })
    } catch (error) {
      console.error('❌ Error al actualizar los stock:', error)

      return res.status(500).json({
        message: `Error al actualizar los stock: ${error.message}`
      })
    }
  }

  static async refreshPrices (req, res) {
    try {
      await refreshPrices()
      return res.status(200).json({ message: 'Precios actualizados exitosamente' })
    } catch (error) {
      console.error('❌ Error al actualizar los precios:', error)

      return res.status(500).json({
        message: `Error al actualizar los precios: ${error.message}`
      })
    }
  }

  static async refreshImg (req, res) {
    try {
      await refreshImg()
      return res.status(200).json({ message: 'Imagenes actualizadas exitosamente' })
    } catch (error) {
      console.error('❌ Error al actualizar las imagenes:', error)

      return res.status(500).json({
        message: `Error al actualizar los precios: ${error.message}`
      })
    }
  }

  static async login (req, res) {
    try {
      const { username, password } = req.body
      const usersData = await fs.promises.readFile(usersFilePath, 'utf8')
      const users = JSON.parse(usersData)
      const foundUser = users.find(user => user.username === username.toLowerCase() && user.password === password)
      if (foundUser) {
        return res.status(202).json({ message: 'Logeado correctamente' })
      } else {
        return res.status(403).json({ message: 'Error al logearse, intente de nuevo' })
      }
    } catch (error) {
      console.error('Error al leer el archivo de usuarios:', error)
      return res.status(500).json({ error: 'Server error to login' })
    }
  }

  static async getAllClients (req, res) {
    try {
      const { id } = req.query
      if (!id) { return }

      const result = await AdminModel.getAllClients({ id })

      if (!result) {
        return res.status(403).json({ message: 'Error al traer clientes' })
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Expires', '0')
      res.setHeader('Pragma', 'no-cache')

      res.json(result)
    } catch (error) {
      console.error('Error al actualizar los datos:', error)
      return res.status(500).json({ message: 'Error del servidor al traer clientes' })
    }
  }

  static async importClients (req, res) {
    try {
      const clients = req.body // Array de clientes
      if (!Array.isArray(clients)) {
        return res.status(400).json({ message: 'Formato de datos incorrecto' })
      }

      let count = 0
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i]
        // Validar que el cliente tenga los campos necesarios
        if (!client || !client.name || !client.email || !client.phone) {
          continue // Si falta algún campo, saltar este cliente
        }
        await ClientModel.addSubscriber({ input: client })
        count++
      }
      res.json({ success: true, message: 'Clientes importados: ' + count })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al importar clientes', error: error.message })
    }
  }

  static getImportProgress (req, res) {
    const { importId } = req.params
    if (!importId || !importProgress[importId]) {
      return res.status(404).json({ ok: false, message: 'Importación no encontrada' })
    }
    res.json({ ok: true, ...importProgress[importId] })
  }

  static async importClientsExcel (req, res) {
    // Generar importId y registrar progreso
    const importId = uuidv4()
    importProgress[importId] = { analizados: 0, importados: 0, saltados: 0, estado: 'procesando' }
    const filePath = req.file ? req.file.path : null

    // Responder inmediatamente al frontend
    res.json({ ok: true, importId });

    // Procesar en segundo plano
    (async () => {
      let analizados = 0
      try {
        if (!req.file) {
          importProgress[importId].estado = 'error'
          importProgress[importId].mensaje = 'No se subió ningún archivo'
          return
        }
        // Leer el archivo Excel usando xlsx
        let workbook, sheetName, sheet, rows
        try {
          workbook = xlsx.readFile(req.file.path)
          sheetName = workbook.SheetNames[0]
          sheet = workbook.Sheets[sheetName]
          rows = xlsx.utils.sheet_to_json(sheet, { defval: '-' })
        } catch (err) {
          importProgress[importId].estado = 'error'
          importProgress[importId].mensaje = 'Error al leer el archivo Excel'
          return
        }
        // Mapeo de columnas y normalización de documento
        let mappedRows
        try {
          mappedRows = rows.map(row => ({
            tipo_moneda: row['Moneda de la   Cuenta Corriente'] || '-',
            pais: row.Pais || '-',
            provincia: row['Provincia / Estado / Region'] || '-',
            clase_fiscal: row['Clase Fiscal'] || '-',
            tipo_documento: row['Tipos de Documentos'] || '-',
            documento: String(row['Numero de Documento']).trim() || '-',
            razon_social: row['RAZoN SOCIAL / APELLIDO'] || '-',
            ciudad: row['Ciudad / Localidad / Comuna'] || '-',
            domicilio: row.Domicilio || '-',
            celular: row.Telefono || '-',
            vendedor: row.Vendedor || '-',
            fecha_alta: row['Fecha de alta'] || '-',
            inactivo: '0'
          }))
        } catch (err) {
          importProgress[importId].estado = 'error'
          importProgress[importId].mensaje = 'Error en mapeo de columnas'
          return
        }
        // Filtra los que ya existen en la base de datos (por documento normalizado)
        const nuevosClientes = []
        analizados = mappedRows.length
        let revisados = 0
        for (const cliente of mappedRows) {
          try {
            const existe = await AdminModel.existeClientePorDocumento(cliente.documento)
            revisados++
            importProgress[importId].analizados = revisados
            if (!existe) {
              nuevosClientes.push(cliente)
              importProgress[importId].importados = nuevosClientes.length
            } else {
              importProgress[importId].saltados = revisados - nuevosClientes.length
            }
          } catch (err) {
            importProgress[importId].estado = 'error'
            importProgress[importId].mensaje = `Error al chequear existencia de documento (${cliente.documento})`
            return
          }
        }
        if (nuevosClientes.length > 0) {
          try {
            await AdminModel.bulkInsertClients(nuevosClientes)
          } catch (err) {
            importProgress[importId].estado = 'error'
            importProgress[importId].mensaje = 'Error en inserción masiva'
            return
          }
        }
        importProgress[importId].estado = 'finalizado'
      } catch (e) {
        importProgress[importId].estado = 'error'
        importProgress[importId].mensaje = e.message
      } finally {
        if (filePath) {
          try { fs.unlinkSync(filePath) } catch (err) {}
        }
        setTimeout(() => { delete importProgress[importId] }, 10 * 60 * 1000)
      }
    })()
  }

  static async crearClienteEspecial (req, res) {
    const {
      numero_cliente,
      razon_social,
      domicilio,
      ciudad,
      provincia,
      clase_fiscal,
      documento,
      tel
    } = req.body
    if (!razon_social || !domicilio || !ciudad || !provincia || !clase_fiscal || !documento) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }
    try {
      const cliente = await AdminModel.insertClienteEspecial({
        numero_cliente,
        razon_social,
        domicilio,
        ciudad,
        provincia,
        clase_fiscal,
        documento,
        tel
      })
      res.json(cliente)
    } catch (err) {
      res.status(500).json({ error: 'Error al crear cliente especial' })
    }
  }

  static async listarClientesEspeciales (req, res) {
    try {
      const clientes = await AdminModel.getAllClientesEspeciales()
      res.json(clientes)
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener clientes especiales' })
    }
  }

  static async setActivadoClienteEspecial (req, res) {
    const { id } = req.params
    const { activado } = req.body
    if (typeof activado === 'undefined') return res.status(400).json({ error: 'Falta el campo activado' })
    try {
      await AdminModel.setClienteEspecialActivado(id, activado)
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar estado' })
    }
  }

  static async listarClientesEspecialesActivos (req, res) {
    try {
      const clientes = await AdminModel.getClientesEspecialesActivos()
      res.json(clientes)
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener clientes especiales activos' })
    }
  }
}

module.exports = AdminController
