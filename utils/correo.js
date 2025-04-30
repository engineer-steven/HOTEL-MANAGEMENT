const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreoReserva(destinatario, datos) {
  const mensaje = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Confirmación de reserva',
    text: `Estimado ${datos.nombre}, su reserva ha sido registrada.\n\nEntrada: ${datos.fechaEntrada}\nSalida: ${datos.fechaSalida}`
  };

  try {
    await transporter.sendMail(mensaje);
    console.log('📧 Correo enviado correctamente');
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
  }
}

module.exports = { enviarCorreoReserva };
