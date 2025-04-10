const { Reserva, Factura, Habitacion } = require('../models');
const dayjs = require('dayjs');

exports.realizarCheckOut = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    if (reserva.estado === 'Finalizada') {
      return res.status(400).json({ error: 'La reserva ya fue finalizada' });
    }

    const dias = dayjs(reserva.fechaSalida).diff(dayjs(reserva.fechaEntrada), 'day');
    const habitacion = await Habitacion.findByPk(reserva.HabitacionId);

    const total = dias * habitacion.precioPorNoche;

    const factura = await Factura.create({
      monto: total,
      metodoPago: 'Tarjeta',
      ReservaId: reserva.id
    });

    await reserva.update({ estado: 'Finalizada' });
    await habitacion.update({ disponible: true });

    res.status(200).json({ mensaje: 'Check-out realizado', factura });
  } catch (error) {
    console.error('❌ Error en check-out:', error);
    res.status(500).json({ error: 'Error al procesar el check-out' });
  }
};
