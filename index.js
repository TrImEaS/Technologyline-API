const express = require('express')
const cors = require('cors')
const productRouter = require ('./src/Routes/product.js')


const PORT = process.env.PORT || 8080
const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cors())
app.use(express.static('/home/realcolorweb/public_html/technologyline.com.ar/products-images'))


// Get an simple hi
app.get('/', (req, res) =>{
  res.json({ message: 'Hi welcome to the API 👌😂👌😂👌😂👌.' })
})

app.options('/products', (req, res) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'https://www.technologyline.com.ar', 'https://www.line-technology.com.ar']
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', true)  
  } 
  res.send(200)
})

app.use('/products', productRouter)

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`))

