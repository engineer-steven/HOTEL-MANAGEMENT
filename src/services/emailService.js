const nodemailer = require('nodemailer');
const db = require('../database');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para enviar correo de confirmación de reserva
const sendReservationConfirmation = async (reservation) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reservation.email,
            subject: 'Confirmación de Reserva',
            html: `
                <h1>¡Reserva Confirmada!</h1>
                <p>Estimado/a ${reservation.nombre},</p>
                <p>Su reserva ha sido confirmada con éxito. A continuación los detalles:</p>
                <ul>
                    <li>Número de Reserva: ${reservation.id}</li>
                    <li>Fecha de Check-in: ${reservation.fecha_entrada}</li>
                    <li>Fecha de Check-out: ${reservation.fecha_salida}</li>
                    <li>Habitación: ${reservation.habitacion_id}</li>
                </ul>
                <p>Gracias por elegir nuestro hotel. ¡Esperamos su visita!</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error al enviar correo de confirmación de reserva:', error);
        throw error;
    }
};

// Función para enviar correo de confirmación de pago
const sendPaymentConfirmation = async (invoice) => {
    try {
        // Primero obtenemos los detalles de la reserva
        const reservation = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM reservas WHERE id = ?', [invoice.reserva_id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Reserva no encontrada'));
                } else {
                    resolve(row);
                }
            });
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reservation.email,
            subject: 'Confirmación de Pago',
            html: `
                <h1>¡Pago Confirmado!</h1>
                <p>Estimado/a ${reservation.nombre},</p>
                <p>Su pago ha sido procesado con éxito. A continuación los detalles:</p>
                <ul>
                    <li>Número de Factura: ${invoice.id}</li>
                    <li>Monto: $${invoice.monto}</li>
                    <li>Método de Pago: ${invoice.metodo_pago}</li>
                    <li>Fecha: ${invoice.fecha_creacion}</li>
                </ul>
                <p>Gracias por su pago. ¡Esperamos verlo pronto!</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error al enviar correo de confirmación de pago:', error);
        throw error;
    }
};

module.exports = {
    sendReservationConfirmation,
    sendPaymentConfirmation
}; 