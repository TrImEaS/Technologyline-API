const express = require('express')
const cors = require('cors')
const apiRouter = require('./src/Routes/apiRouter')
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080
const IP_LOG_FILE_JSON = path.join(__dirname, './src/Data/ip_log.json');
const STATISTICS_FILE_JSON = path.join(__dirname, './src/Data/statistics.json');
const app = express()
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:8080', 
  'https://www.technologyline.com.ar', 
  'https://www.line-technology.com.ar'
]

app.disable('x-powered-by')
app.use(express.json())
app.use(express.static('/home/realcolorweb/public_html/technologyline.com.ar/products-images'))
app.use(express.static('/home/realcolorweb/public_html/technologyline.com.ar/banners-images'))
app.use(cors({ origin: allowedOrigins }))

const loadJSON = (filePath) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }
  return {};
};

const saveJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Middleware para manejar el registro de visitas
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const currentTime = Date.now();

  // Cargar el archivo de estadísticas y el archivo de IPs
  const statistics = loadJSON(STATISTICS_FILE_JSON);
  const ipLog = loadJSON(IP_LOG_FILE_JSON);

  // Inicializar las visitas si aún no se ha hecho
  if (!statistics.views) {
    statistics.views = 0;
  }

  // Verificar si la IP ha sido registrada en los últimos 20 minutos
  if (!ipLog[ip] || currentTime - ipLog[ip] > 1200000) {
    ipLog[ip] = currentTime;
    statistics.views += 1;

    saveJSON(IP_LOG_FILE_JSON, ipLog);
    saveJSON(STATISTICS_FILE_JSON, statistics);

    console.log(`Visita registrada de IP: ${ip}. Total de visitas: ${statistics.views}`);
  } else {
    console.log(`Visita ignorada para IP: ${ip}`);
  }

  next();
});

app.use('/admin/page', express.static('/home/realcolorweb/public_html/technologyline.com.ar/admin/page'));
app.use('/admin/remitos', express.static('/home/realcolorweb/public_html/technologyline.com.ar/admin/remitos'));
app.use('/admin/QRGen-App/app', express.static('/home/realcolorweb/public_html/technologyline.com.ar/admin/QRGen-App/app'));
app.use('/api', apiRouter)

app.get('/admin/page/*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/page/index.html');
});

app.get('/admin/remitos/*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/remitos/index.html');
});

app.get('/admin/QRGen-App/app/*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/QRGen-App/app/index.html');
});

app.get('*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/error.html');
})

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`))