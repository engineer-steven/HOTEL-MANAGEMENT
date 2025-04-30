const { Factura, Reserva, Huesped } = require('../models');
const db = require('../models');
const dayjs = require('dayjs');

const facturaController = {
  // Consultar todas las facturas
  consultarFacturas: async (req, res) => {
    try {
      const facturas = await db.Factura.findAll({
        include: [
          {
            model: db.Reserva,
            include: [
              {
                model: db.Huesped,
                attributes: ['id', 'nombre', 'apellido', 'documento']
              }
            ]
          }
        ]
      });
      res.status(200).json(facturas);
    } catch (error) {
      console.error('Error al consultar facturas:', error);
      res.status(500).json({ error: 'No se pudieron obtener las facturas' });
    }
  },

  // Consultar facturas por huésped
  consultarFacturasPorHuesped: async (req, res) => {
    try {
      const { huespedId } = req.params;
      const facturas = await db.Factura.findAll({
        include: [
          {
            model: db.Reserva,
            where: { huespedId },
            include: [
              {
                model: db.Huesped,
                attributes: ['id', 'nombre', 'apellido', 'documento']
              }
            ]
          }
        ]
      });

      res.status(200).json(facturas);
    } catch (error) {
      console.error('Error al consultar facturas por huésped:', error);
      res.status(500).json({ error: 'No se pudieron recuperar las facturas. Por favor, intente nuevamente.' });
    }
  },

  // Consultar una factura específica
  consultarFactura: async (req, res) => {
    try {
      const { facturaId } = req.params;
      const factura = await db.Factura.findByPk(facturaId, {
        include: [
          {
            model: db.Reserva,
            include: [
              {
                model: db.Huesped,
                attributes: ['id', 'nombre', 'apellido', 'documento']
              }
            ]
          }
        ]
      });

      if (!factura) {
        return res.status(404).json({ mensaje: 'No se encontró la factura especificada.' });
      }

      res.status(200).json(factura);
    } catch (error) {
      console.error('Error al consultar factura:', error);
      res.status(500).json({ error: 'Ocurrió un error al consultar la factura. Por favor, intente nuevamente.' });
    }
  },

  // Anular una factura
  anularFactura: async (req, res) => {
    try {
      const { facturaId } = req.params;
      const factura = await db.Factura.findByPk(facturaId);

      if (!factura) {
        return res.status(404).json({ error: 'No se encontró la factura especificada.' });
      }

      await db.Factura.update(
        { estado: 'Anulada' },
        { where: { id: facturaId } }
      );

      res.status(200).json({ mensaje: 'La factura ha sido anulada correctamente' });
    } catch (error) {
      console.error('Error al anular factura:', error);
      res.status(500).json({ error: 'No se pudo anular la factura. Por favor, intente nuevamente.' });
    }
  },

  realizarCheckOutYGenerarFactura: async (req, res) => {
    try {
      const { reservaId } = req.params;
      const { metodoPago } = req.body;

      const reserva = await db.Reserva.findByPk(reservaId, {
        include: [
          { model: db.Habitacion, as: 'Habitacion' },
          { model: db.Huesped, as: 'Huesped' }
        ]
      });

      if (!reserva) {
        return res.status(404).json({ mensaje: 'No se encontró la reserva especificada para realizar el check-out y generar la factura.' });
      }

      if (reserva.estado === 'Finalizada') {
        return res.status(400).json({ mensaje: 'Esta reserva ya ha sido finalizada y cuenta con una factura generada.' });
      }

      const diasEstancia = dayjs(reserva.fechaSalida).diff(dayjs(reserva.fechaEntrada), 'day');
      const monto = diasEstancia * reserva.Habitacion.tipoTarifa;

      const factura = await db.Factura.create({
        ReservaId: reservaId,
        monto,
        metodoPago
      });

      await reserva.update({ estado: 'Finalizada' });
      await reserva.Habitacion.update({ disponible: true });

      return res.status(200).json({
        mensaje: 'El check-out se ha realizado exitosamente y la factura ha sido generada',
        factura
      });
    } catch (error) {
      console.error('Error al realizar check-out:', error);
      return res.status(500).json({ error: 'Error al realizar el check-out y generar la factura' });
    }
  }
};

module.exports = facturaController;