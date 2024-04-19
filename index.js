const express = require('express')
const cors = require('cors')
const viewsCounter = require('./src/Middlewares/viewsCounter.js')
const apiRouter = require('./src/Routes/apiRouter')

const PORT = process.env.PORT || 8080
const app = express()
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']

app.disable('x-powered-by')
app.use(express.json())
app.use(express.static('/home/realcolorweb/public_html/technologyline.com.ar/products-images'))
app.use(cors({
  origin: allowedOrigins
}))

app.get('/', async (req, res) =>{
  await viewsCounter()
})

app.use('/api', apiRouter)

app.get('*', (req, res) => {
  res.sendFile('/home/realcolorweb/public_html/technologyline.com.ar/', 'index.html')
})


app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`))


// app.options('/api/products', (req, res) => {
//   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
//   const origin = req.headers.origin
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     res.header('Access-Control-Allow-Credentials', true)  
//   } 
//   res.send(204)
// })

// app.options('/api/admin/login', (req, res) => {
//   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
//   const origin = req.headers.origin
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     res.header('Access-Control-Allow-Credentials', true)  
//   } 
//   res.send(204)
// })

// app.options('/api/clients', (req, res) => {
//   const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
//   const origin = req.headers.origin
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     res.header('Access-Control-Allow-Credentials', true)  
//   } 
//   res.send(204)
// })