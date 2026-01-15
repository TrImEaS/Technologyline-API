const nodemailer = require('nodemailer')

// Configuración del transportador
const transporter = nodemailer.createTransport({
  host: 'mail.real-color.com.ar',
  port: 465,
  secure: true,
  auth: {
    user: 'subsistemas@real-color.com.ar',
    pass: 'Dacarry-123@'
  },
  requireTLS: true,
  tls: {
    // Permite certificados self-signed — solo si confías en el servidor
    rejectUnauthorized: false
  }
})

function sendMail ({ input }) {
  const { fullname, email, phone, comentary } = input
  const message = `
    Nombre: ${fullname}
    Email: ${email}
    Teléfono: ${phone}
    Comentario: ${comentary}
  `

  const mailOptions = {
    from: 'subsistemas@real-color.com.ar', // Remitente
    to: 'revendedores@realcolor.com.ar', // Destinatario
    subject: 'Nuevo formulario de revendedor',
    text: message
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error)
    } else {
      console.log('Correo enviado:', info.response)
    }
  })
}

module.exports = sendMail
