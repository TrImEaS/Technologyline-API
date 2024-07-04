const express = require('express')
const cors = require('cors')
const apiRouter = require('./src/Routes/apiRouter')

const PORT = process.env.PORT || 8080
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
app.use(cors({
  origin: allowedOrigins
}))

app.get('/', async (req, res) =>{
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/', 'index.html')
})
|
app.use('/api', apiRouter)

app.get('/admin/page', async (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/page/', 'index.html');
});

app.get('/admin/page/products/*', async (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/admin/page/', 'index.html');
});

app.get('*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/', 'index.html');
})

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`))