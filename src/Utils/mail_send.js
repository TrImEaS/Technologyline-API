const nodemailer = require('nodemailer');

// Configuración del transportador
const transporter = nodemailer.createTransport({
  host: 'mail.real-color.com.ar',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: 'subsistemas@real-color.com.ar', // Tu email
    pass: 'FacuFacu9090' // Tu contraseña
  }
});

function sendMail({ input }) {
  const { fullname, email, phone, comentary } = input;
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
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}

module.exports = sendMail