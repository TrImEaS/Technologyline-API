const ipSet = new Set()

const ipFilter = (req, res, next) => {
  const ip = req.ip

  if (!ipSet.has(ip)) {
    ipSet.add(ip)

    // Eliminar la IP del set después de 30 minutos
    setTimeout(() => {
      ipSet.delete(ip)
    }, 30 * 60 * 1000) // 30 minutos

    next() // Continuar con el siguiente middleware (viewsCounter)
  } else {
    res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar', 'index.html')
  }
}

module.exports = ipFilter