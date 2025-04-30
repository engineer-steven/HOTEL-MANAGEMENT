const { sendPaymentConfirmation } = require('../services/emailService');

const createInvoice = async (req, res) => {
    try {
        const { reserva_id, monto, metodo_pago, detalles } = req.body;

        const sql = `INSERT INTO facturas (reserva_id, monto, metodo_pago, detalles, fecha_creacion) 
                    VALUES (?, ?, ?, ?, datetime('now'))`;
        
        db.run(sql, [reserva_id, monto, metodo_pago, detalles], function(err) {
            if (err) {
                console.error('Error al crear la factura:', err);
                return res.status(500).json({ error: 'Error al crear la factura' });
            }

            const newInvoice = {
                id: this.lastID,
                reserva_id,
                monto,
                metodo_pago,
                detalles,
                fecha_creacion: new Date().toISOString()
            };

            // Enviar correo de confirmación de pago
            sendPaymentConfirmation(newInvoice)
                .catch(error => console.error('Error al enviar email de confirmación de pago:', error));

            res.status(201).json(newInvoice);
        });
    } catch (error) {
        console.error('Error en createInvoice:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}; 