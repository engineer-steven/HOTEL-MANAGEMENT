const { sendReservationConfirmation } = require('../services/emailService');

const createReservation = async (req, res) => {
    try {
        const { nombre, email, telefono, fecha_entrada, fecha_salida, habitacion, precio_total } = req.body;

        // Validar fechas
        if (new Date(fecha_entrada) >= new Date(fecha_salida)) {
            return res.status(400).json({ error: 'La fecha de entrada debe ser anterior a la fecha de salida' });
        }

        const sql = `INSERT INTO reservas (nombre, email, telefono, fecha_entrada, fecha_salida, habitacion, precio_total, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`;
        
        db.run(sql, [nombre, email, telefono, fecha_entrada, fecha_salida, habitacion, precio_total], function(err) {
            if (err) {
                console.error('Error al crear la reserva:', err);
                return res.status(500).json({ error: 'Error al crear la reserva' });
            }

            const newReservation = {
                id: this.lastID,
                nombre,
                email,
                telefono,
                fecha_entrada,
                fecha_salida,
                habitacion,
                precio_total,
                estado: 'pendiente'
            };

            // Enviar correo de confirmación
            sendReservationConfirmation(newReservation)
                .catch(error => console.error('Error al enviar email de confirmación:', error));

            res.status(201).json(newReservation);
        });
    } catch (error) {
        console.error('Error en createReservation:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}; 