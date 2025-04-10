const { Reserva, Habitacion, Huesped, Factura } = require('../models');
const dayjs = require('dayjs');
const { Op } = require('sequelize');

exports.crearReserva = async (req, res) => {
  try {
    const { HabitacionId, HuespedId, fechaEntrada, fechaSalida } = req.body;

    if (!HabitacionId || !HuespedId || !fechaEntrada || !fechaSalida) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la reserva.' });
    }

    // Verificar disponibilidad de la habitación
    const habitacion = await Habitacion.findByPk(HabitacionId);
    if (!habitacion || !habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación no está disponible.' });
    }

    // Crear la reserva
    const reserva = await Reserva.create({
      HabitacionId,
      HuespedId,
      fechaEntrada,
      fechaSalida,
      estado: 'Pendiente', // Inicialmente la reserva está pendiente
    });

    // Marcar la habitación como no disponible
    await Habitacion.update({ disponible: false }, { where: { id: HabitacionId } });

    res.status(201).json({ mensaje: 'Reserva creada con éxito', reserva });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ mensaje: 'Error al crear la reserva.' });
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
    res.status(500).json({ mensaje: 'Error al obtener las reservas.' });
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
  const { id } = req.params;
  const { metodoPago } = req.body;
  try {
    const reserva = await Reserva.findByPk(id, {
      include: [{ model: Habitacion, as: 'Habitacion' }, { model: Huesped, as: 'Huesped' }], // Include Huesped as well
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada para realizar el check-out.' });
    }

    if (reserva.estado === 'Finalizada') {
      return res.status(400).json({ mensaje: 'El check-out ya se realizó para esta reserva.' });
    }

    const fechaEntrada = dayjs(reserva.fechaEntrada);
    const fechaSalida = dayjs(reserva.fechaSalida);
    const noches = fechaSalida.diff(fechaEntrada, 'day');
    const total = noches * parseFloat(reserva.Habitacion.tipoTarifa); // Usar tipoTarifa

    // Crear la factura
    const factura = await Factura.create({
      monto: total,
      metodoPago: metodoPago,
      ReservaId: reserva.id,
    });

    // Actualizar el estado de la reserva a 'Finalizada'
    await Reserva.update({ estado: 'Finalizada' }, { where: { id: reserva.id } });

    // Marcar la habitación como disponible
    await Habitacion.update({ disponible: true }, { where: { id: reserva.HabitacionId } });

    res.status(200).json({ mensaje: 'Check-out realizado con éxito', factura });
  } catch (error) {
    console.error('Error al realizar el check-out:', error);
    res.status(500).json({ mensaje: 'Error al realizar el check-out.' });
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
    res.status(500).json({ mensaje: 'Error al verificar la disponibilidad.' });
  }
};

exports.buscarHuesped = async (req, res) => {
  const { documento } = req.query;
  try {
    if (!documento) {
      return res.status(400).json({ mensaje: 'Se requiere el número de documento para buscar un huésped.' });
    }
    const huesped = await Huesped.findOne({ where: { documento } });
    if (!huesped) {
      return res.status(404).json({ mensaje: 'Huésped no encontrado.' });
    }
    res.status(200).json({ huesped });
  } catch (error) {
    console.error('Error al buscar el huésped:', error);
    res.status(500).json({ mensaje: 'Error al buscar el huésped.' });
  }
};