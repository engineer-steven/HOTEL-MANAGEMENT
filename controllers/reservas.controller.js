const { Reserva, Habitacion, Huesped, Factura } = require('../models');
const dayjs = require('dayjs');
const { Op } = require('sequelize');

exports.crearReserva = async (req, res) => {
  try {
    const { HabitacionId, HuespedId, fechaEntrada, fechaSalida } = req.body;

    if (!HabitacionId || !HuespedId || !fechaEntrada || !fechaSalida) {
      return res.status(400).json({ error: 'Por favor, complete todos los campos requeridos para la reserva.' });
    }

    const habitacion = await Habitacion.findByPk(HabitacionId);
    if (!habitacion || !habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación seleccionada no está disponible en este momento.' });
    }

    const reserva = await Reserva.create({
      HabitacionId,
      HuespedId,
      fechaEntrada,
      fechaSalida,
      estado: 'Confirmada'
    });

    await Habitacion.update({ disponible: false }, { where: { id: HabitacionId } });

    return res.status(201).json({
      mensaje: 'La reserva ha sido creada exitosamente',
      reserva
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return res.status(500).json({ error: 'Ocurrió un error al crear la reserva. Por favor, intente nuevamente.' });
  }
};

exports.obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Habitacion, as: 'Habitacion' },
        { model: Huesped, as: 'Huesped' },
      ],
    });
    res.status(200).json({ reservas });
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener las reservas. Por favor, intente nuevamente.' });
  }
};

exports.obtenerReservaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await Reserva.findByPk(id, {
      include: [
        { model: Habitacion, as: 'Habitacion' },
        { model: Huesped, as: 'Huesped' },
      ],
    });
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }
    res.status(200).json({ reserva });
  } catch (error) {
    console.error('Error al obtener la reserva:', error);
    res.status(500).json({ mensaje: 'Error al obtener la reserva.' });
  }
};

exports.actualizarReserva = async (req, res) => {
  const { id } = req.params;
  const { fechaEntrada, fechaSalida } = req.body;
  try {
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }

    await Reserva.update({ fechaEntrada, fechaSalida }, { where: { id } });
    const reservaActualizada = await Reserva.findByPk(id, {
      include: [
        { model: Habitacion, as: 'Habitacion' },
        { model: Huesped, as: 'Huesped' },
      ],
    });
    res.status(200).json({ reserva: reservaActualizada });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la reserva.' });
  }
};

exports.eliminarReserva = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }

    // Marcar la habitación como disponible si la reserva no ha finalizado
    if (reserva.estado !== 'Finalizada') {
      await Habitacion.update({ disponible: true }, { where: { id: reserva.HabitacionId } });
    }

    await Reserva.destroy({ where: { id } });
    res.status(200).json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la reserva.' });
  }
};

exports.realizarCheckOut = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const { metodoPago, monto } = req.body;

    const reserva = await Reserva.findByPk(reservaId, {
      include: [Habitacion]
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'No se encontró la reserva especificada para realizar el check-out.' });
    }

    if (reserva.estado === 'Finalizada') {
      return res.status(400).json({ mensaje: 'Esta reserva ya ha sido finalizada.' });
    }

    await reserva.update({ estado: 'Finalizada' });
    await reserva.Habitacion.update({ disponible: true });

    const factura = await Factura.create({
      ReservaId: reservaId,
      metodoPago,
      monto
    });

    return res.status(200).json({
      mensaje: 'Check-out realizado y factura generada exitosamente',
      factura
    });
  } catch (error) {
    console.error('Error al realizar check-out:', error);
    return res.status(500).json({ error: 'Ocurrió un error al realizar el check-out. Por favor, intente nuevamente.' });
  }
};

exports.consultarFacturasHuesped = async (req, res) => {
  const { HuespedId } = req.params;
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Reserva,
          where: { HuespedId: HuespedId },
          include: [Huesped],
        },
      ],
    });
    res.status(200).json({ facturas });
  } catch (error) {
    console.error('Error al consultar las facturas del huésped:', error);
    res.status(500).json({ mensaje: 'Error al consultar las facturas del huésped.' });
  }
};

exports.verificarDisponibilidad = async (_req, res) => {
  try {
    const habitacionesDisponibles = await Habitacion.findAll({ where: { disponible: true } });
    res.status(200).json({ habitacionesDisponibles });
  } catch (error) {
    console.error('Error al verificar la disponibilidad:', error);
    res.status(500).json({ mensaje: 'No se pudo verificar la disponibilidad de las habitaciones.' });
  }
};

exports.buscarHuesped = async (req, res) => {
  const { documento } = req.query;
  try {
    if (!documento) {
      return res.status(400).json({ mensaje: 'Por favor, proporcione el número de documento para buscar al huésped.' });
    }
    const huesped = await Huesped.findOne({ where: { documento } });
    if (!huesped) {
      return res.status(404).json({ mensaje: 'No se encontró ningún huésped con el documento proporcionado.' });
    }
    res.status(200).json({ huesped });
  } catch (error) {
    console.error('Error al buscar el huésped:', error);
    res.status(500).json({ mensaje: 'Ocurrió un error al buscar al huésped. Por favor, intente nuevamente.' });
  }
};