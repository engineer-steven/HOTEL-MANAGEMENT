const db = require('../models');
const dayjs = require('dayjs');

const crearReservaRecepcionista = async (req, res) => {
  try {
    const { HabitacionId, HuespedId, fechaEntrada, fechaSalida } = req.body;

    if (!HabitacionId || !HuespedId || !fechaEntrada || !fechaSalida) {
      return res.status(400).json({ error: 'Por favor, complete todos los campos requeridos para la reserva.' });
    }

    const habitacion = await db.Habitacion.findByPk(HabitacionId);
    if (!habitacion || !habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación seleccionada no está disponible en este momento.' });
    }

    const reserva = await db.Reserva.create({
      HabitacionId,
      HuespedId,
      fechaEntrada,
      fechaSalida,
      estado: 'Confirmada'
    });

    await db.Habitacion.update({ disponible: false }, { where: { id: HabitacionId } });

    return res.status(201).json({
      mensaje: 'La reserva ha sido creada exitosamente',
      reserva
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return res.status(500).json({ error: 'Ocurrió un error al crear la reserva. Por favor, intente nuevamente.' });
  }
};

const realizarCheckInRecepcionista = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const reserva = await db.Reserva.findByPk(reservaId, {
      include: [db.Habitacion, db.Huesped]
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'No se encontró la reserva especificada.' });
    }

    if (!reserva.Habitacion.disponible) {
      return res.status(400).json({ mensaje: 'La habitación para esta reserva no está disponible.' });
    }

    await db.Reserva.update({ estado: 'En curso' }, { where: { id: reservaId } });
    await db.Habitacion.update({ disponible: false }, { where: { id: reserva.HabitacionId } });

    return res.status(200).json({ mensaje: 'Check-in realizado con éxito', reserva });
  } catch (error) {
    console.error('Error al realizar check-in:', error);
    return res.status(500).json({ error: 'Ocurrió un error al realizar el check-in. Por favor, intente nuevamente.' });
  }
};

const obtenerDashboard = async (req, res) => {
  try {
    const hoy = dayjs().startOf('day');
    
    // Obtener check-ins de hoy
    const checkInsHoy = await db.Reserva.count({
      where: {
        fechaEntrada: hoy.toDate(),
        estado: 'En curso'
      }
    });

    // Obtener check-outs de hoy
    const checkOutsHoy = await db.Reserva.count({
      where: {
        fechaSalida: hoy.toDate(),
        estado: 'En curso'
      }
    });

    // Obtener habitaciones disponibles
    const habitacionesDisponibles = await db.Habitacion.count({
      where: {
        disponible: true
      }
    });

    // Obtener próximas llegadas
    const proximasLlegadas = await db.Reserva.findAll({
      where: {
        fechaEntrada: {
          [db.Sequelize.Op.gte]: hoy.toDate()
        },
        estado: 'Confirmada'
      },
      include: [{
        model: db.Huesped,
        attributes: ['nombre', 'apellido']
      }, {
        model: db.Habitacion,
        attributes: ['numero']
      }],
      order: [['fechaEntrada', 'ASC']],
      limit: 5
    });

    return res.status(200).json({
      checkInsHoy,
      checkOutsHoy,
      habitacionesDisponibles,
      proximasLlegadas: proximasLlegadas.map(llegada => ({
        reservaId: llegada.id,
        huespedNombre: `${llegada.Huesped.nombre} ${llegada.Huesped.apellido}`,
        habitacion: llegada.Habitacion.numero
      }))
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    return res.status(500).json({ error: 'Ocurrió un error al obtener el dashboard.' });
  }
};

module.exports = {
  obtenerDashboard,
  crearReservaRecepcionista,
  realizarCheckInRecepcionista
};