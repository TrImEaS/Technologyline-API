const express = require('express')
const cors = require('cors')
const apiRouter = require('./src/Routes/apiRouter')
const setupStaticRoutes = require('./src/Routes/staticRoutes')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser')

const isDev = process.env.NODE_ENV !== 'production'
const STATIC_BASE = isDev
  ? path.join(__dirname, './src/FakeStatic')
  : '/home/realcolorweb/public_html/technologyline.com.ar'

const PORT = process.env.PORT || 8080
const IP_LOG_FILE_JSON = path.join(__dirname, './src/Data/ip_log.json')
const STATISTICS_FILE_JSON = path.join(__dirname, './src/Data/statistics.json')

const app = express()
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://www.technologyline.com.ar',
    'https://technologyline.com.ar',
    'https://www.line-technology.com.ar',
    'https://www.realcolor.com.ar',
    'https://www.real-color.com.ar',
    'https://real-color.com.ar',
    'https://realcolor.com.ar'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}

app.disable('x-powered-by')
app.use(cookieParser())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(express.static('public', { maxAge: '1y' }))
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// registro de IPs/views (igual que antes)
function loadJSON (filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }
  return {}
}
function saveJSON (filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
app.use(function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.ip
  const now = Date.now()
  const stats = loadJSON(STATISTICS_FILE_JSON)
  const ipLog = loadJSON(IP_LOG_FILE_JSON)
  if (!stats.views) stats.views = 0
  if (!ipLog[ip] || now - ipLog[ip] > 1200000) {
    ipLog[ip] = now
    stats.views++
    saveJSON(IP_LOG_FILE_JSON, ipLog)
    saveJSON(STATISTICS_FILE_JSON, stats)
  }
  next()
})

setupStaticRoutes(app, STATIC_BASE)
app.use('/api', apiRouter)

app.listen(PORT, function () { console.log('Server listening on http://localhost:' + PORT) })
app.timeout = 300000
