const { Factura, Reserva, Huesped } = require('../models');
const db = require('../models'); // Importa la instancia de la base de datos

exports.consultarFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Reserva,
          include: [Huesped],
        },
      ],
    });

    res.status(200).json(facturas);
  } catch (error) {
    console.error('❌ Error al consultar facturas:', error);
    res.status(500).json({ error: 'No se pudieron obtener las facturas' });
  }
};

exports.obtenerFacturasPorHuesped = async (req, res) => {
  const { HuespedId } = req.query;
  if (!HuespedId) {
    return res.status(400).json({ error: 'Se requiere el ID del huésped para consultar las facturas.' });
  }
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Reserva,
          where: { HuespedId: HuespedId },
          attributes: ['HuespedId'],
          include: [Huesped], // Include Huesped here as well if needed in the response
        },
      ],
    });
    res.status(200).json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas por huésped:', error);
    res.status(500).json({ error: 'Error al obtener las facturas del huésped.' });
  }
};

exports.realizarCheckOutYGenerarFactura = async (req, res) => {
  const { reservaId } = req.params;
  const { metodoPago } = req.body;
  try {
    const reserva = await db.Reserva.findByPk(reservaId, {
      include: [db.Habitacion, db.Huesped],
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada para realizar el check-out y generar la factura.' });
    }

    if (reserva.estado === 'Finalizada') {
      return res.status(400).json({ mensaje: 'El check-out y la factura ya fueron generados para esta reserva.' });
    }

    const fechaEntrada = dayjs(reserva.fechaEntrada);
    const fechaSalida = dayjs(reserva.fechaSalida);
    const noches = fechaSalida.diff(fechaEntrada, 'day');
    const total = noches * parseFloat(reserva.Habitacion.tipoTarifa);

    const factura = await db.Factura.create({
      ReservaId: reserva.id,
      monto: total,
      metodoPago: metodoPago,
    });

    await reserva.update({ estado: 'Finalizada' });
    await reserva.Habitacion.update({ disponible: true });

    res.status(200).json({ mensaje: 'Check-out realizado y factura generada con éxito', factura });
  } catch (error) {
    console.error('Error al realizar check-out y generar factura:', error);
    res.status(500).json({ error: 'Error al realizar el check-out y generar la factura.' });
  }
};