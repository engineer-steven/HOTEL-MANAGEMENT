const db = require('../models');
const dayjs = require('dayjs');

async function crearReservaRecepcionista(req, res) {
  try {
    const { HabitacionId, HuespedId, fechaEntrada, fechaSalida } = req.body;

    if (!HabitacionId || !HuespedId || !fechaEntrada || !fechaSalida) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la reserva.' });
    }

    const habitacion = await db.Habitacion.findByPk(HabitacionId);
    if (!habitacion) {
      return res.status(404).json({ mensaje: 'Habitación no encontrada.' });
    }

    if (!habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación no está disponible.' });
    }

    const nuevaReserva = await db.Reserva.create({
      HabitacionId,
      HuespedId,
      fechaEntrada: dayjs(fechaEntrada).format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs(fechaSalida).format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Confirmada', // Estado inicial de la reserva
    });

    await db.Habitacion.update({ disponible: false }, { where: { id: HabitacionId } });

    return res.status(201).json({ mensaje: 'Reserva creada por recepcionista con éxito', reserva: nuevaReserva });

  } catch (error) {
    console.error('Error al crear reserva por recepcionista:', error);
    return res.status(500).json({ error: 'Error al crear la reserva.' });
  }
}

async function realizarCheckInRecepcionista(req, res) {
  const { reservaId } = req.params;

  try {
    const reserva = await db.Reserva.findByPk(reservaId, {
      include: [db.Habitacion, db.Huesped],
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }

    if (!reserva.Habitacion) {
      console.error('Error: Reserva no tiene habitación asociada.');
      return res.status(500).json({ error: 'Error interno: Habitación no encontrada para la reserva.' });
    }

    if (!reserva.Habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación para esta reserva no está disponible.' });
    }

    await reserva.update({ estado: 'En curso' });
    await reserva.Habitacion.update({ disponible: false }, { where: { id: reserva.HabitacionId } }); // Usar HabitacionId de la reserva

    return res.status(200).json({ mensaje: 'Check-in realizado con éxito', reserva });

  } catch (error) {
    console.error('Error al realizar check-in:', error);
    return res.status(500).json({ error: 'Error al realizar el check-in.' });
  }
}

module.exports = {
  crearReservaRecepcionista,
  realizarCheckInRecepcionista,
  // ... otras funciones del recepcionista podrían ir aquí
};