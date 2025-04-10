const { Pago, Factura, Reserva, Empleado } = require('../models');

exports.registrarPago = async (req, res) => {
  try {
    const { metodoPago, monto, ReservaId } = req.body;

    if (!metodoPago || !monto || !ReservaId) {
      return res.status(400).json({ error: 'Faltan datos del pago' });
    }

    const pago = await Pago.create({ metodoPago, monto, ReservaId });
    res.status(201).json({ mensaje: 'Pago registrado', pago });
  } catch (error) {
    console.error('❌ Error al registrar pago:', error);
    res.status(500).json({ error: 'No se pudo registrar el pago' });
  }
};

exports.consultarFacturasHuesped = async (req, res) => {
  try {
    const { documento } = req.params;
    const facturas = await Factura.findAll({
      include: {
        model: Reserva,
        where: { documento },
      },
    });
    res.status(200).json(facturas);
  } catch (error) {
    console.error('❌ Error al consultar facturas:', error);
    res.status(500).json({ error: 'No se pudieron consultar las facturas' });
  }
};

exports.anularFactura = async (req, res) => {
  try {
    const { facturaId } = req.params;
    const factura = await Factura.findByPk(facturaId);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    await factura.destroy();
    res.status(200).json({ mensaje: 'Factura anulada correctamente' });
  } catch (error) {
    console.error('❌ Error al anular factura:', error);
    res.status(500).json({ error: 'No se pudo anular la factura' });
  }
};

exports.procesarReembolso = async (req, res) => {
  try {
    const { facturaId } = req.body;

    const factura = await Factura.findByPk(facturaId);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    const reembolso = await Pago.create({
      metodoPago: 'Reembolso',
      monto: -factura.monto,
      ReservaId: factura.ReservaId,
    });

    res.status(200).json({ mensaje: 'Reembolso procesado', reembolso });
  } catch (error) {
    console.error('❌ Error al procesar reembolso:', error);
    res.status(500).json({ error: 'No se pudo procesar el reembolso' });
  }
};