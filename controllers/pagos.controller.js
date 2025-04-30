const { Pago, Factura, Reserva, Empleado } = require('../models');

exports.registrarPago = async (req, res) => {
  try {
    const { metodoPago, monto, ReservaId } = req.body;

    if (!metodoPago || !monto || !ReservaId) {
      return res.status(400).json({ error: 'Por favor, complete todos los campos requeridos para el pago.' });
    }

    const pago = await Pago.create({ metodoPago, monto, ReservaId });
    res.status(201).json({ mensaje: 'El pago ha sido registrado exitosamente', pago });
  } catch (error) {
    console.error('❌ Error al registrar pago:', error);
    res.status(500).json({ error: 'No se pudo procesar el pago. Por favor, intente nuevamente.' });
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
    res.status(500).json({ error: 'No se pudieron recuperar las facturas. Por favor, intente nuevamente.' });
  }
};

exports.anularFactura = async (req, res) => {
  try {
    const { facturaId } = req.params;
    const factura = await Factura.findByPk(facturaId);
    if (!factura) return res.status(404).json({ error: 'No se encontró la factura especificada.' });

    await factura.destroy();
    res.status(200).json({ mensaje: 'La factura ha sido anulada correctamente' });
  } catch (error) {
    console.error('❌ Error al anular factura:', error);
    res.status(500).json({ error: 'No se pudo anular la factura. Por favor, intente nuevamente.' });
  }
};

exports.procesarReembolso = async (req, res) => {
  try {
    const { facturaId } = req.body;

    const factura = await Factura.findByPk(facturaId);
    if (!factura) return res.status(404).json({ error: 'No se encontró la factura especificada para el reembolso.' });

    const reembolso = await Pago.create({
      metodoPago: 'Reembolso',
      monto: -factura.monto,
      ReservaId: factura.ReservaId,
    });

    res.status(200).json({ mensaje: 'El reembolso ha sido procesado exitosamente', reembolso });
  } catch (error) {
    console.error('❌ Error al procesar reembolso:', error);
    res.status(500).json({ error: 'No se pudo procesar el reembolso. Por favor, intente nuevamente.' });
  }
};