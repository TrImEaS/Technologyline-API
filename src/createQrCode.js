const fs = require('fs')
const qrcode = require('qrcode')
const crypto = require('crypto')

async function createCode () {
  const randomCode = parseInt(getRandomInt())
  const secureRandom = crypto.randomBytes(16).toString('hex')

  const htmlCodeName = `${secureRandom}.html`
  const result = { validationCode: randomCode, htmlName: htmlCodeName }

  try {
    const htmlContent = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        width: 100vw; 
        height: 100vh; 
        padding: 0; 
        margin: 0;
        color: white;
        font-size: 15rem;
        background: #111;"
      >
        <span>${randomCode}</span>
      </div>
    `
    // html contenedor de codigo de verificacion
    fs.writeFileSync(`./Files/Codes/${htmlCodeName}`, htmlContent, 'utf-8')

    console.log('Archivo HTMLCode creado con éxito.')
    return result
  } catch (error) {
    return console.error('Error al generar HTMLCode:', error)
  }
}

async function createQR (htmlName, { user, billingNumber, company }) {
  const htmlQRName = `${user}-${billingNumber}-${company}.html`

  try {
    if (htmlName === undefined || htmlName === null) {
      return console.log('La url no puede estar vacia. Vuelva a intentarlo')
    }

    const QR = await qrcode.toDataURL(`https://technologyline.com.ar/admin/qr-request/${htmlName}`)
    const htmlContent = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        width: 100vw; 
        height: 100vh; 
        padding: 0; 
        margin: 0;" 
      > 
        <img src='${QR}' >
      </div>
    `

    // html contenedor de QR
    fs.writeFileSync(`./Files/QRs/${htmlQRName}`, htmlContent, 'utf-8')

    console.log('QR creado con éxito.')
    return htmlQRName
  } catch (error) {
    console.error('Error al generar QR:', error)
  }
}

function getRandomInt () {
  try {
    const min = 100000 // Mínimo valor de un número de 6 dígitos
    const max = 999999 // Máximo valor de un número de 6 dígitos
    const generatedNumbers = new Set() // Conjunto para almacenar números generados

    while (true) {
      const randomInt = Math.floor(Math.random() * (max - min + 1)) + min

      // Verificar si el número ya fue generado previamente
      if (!generatedNumbers.has(randomInt)) {
        generatedNumbers.add(randomInt) // Agregar el número al conjunto de números generados
        return randomInt // Devolver el número único
      }
    }
  } catch (error) {
    console.error('Error al generar número aleatorio único:', error)
    throw error
  }
}

module.exports = { createCode, createQR }
