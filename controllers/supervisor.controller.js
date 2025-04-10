// controllers/supervisor.controller.js
const { Empleado, Factura, Pago } = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.registrarRecepcionista = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    const hash = await bcrypt.hash(password, saltRounds);
    const recep = await Empleado.create({ nombre, correo, password: hash, rol: 'Recepcionista' });
    res.status(201).json(recep);
  } catch {
    res.status(500).json({ error: 'Error al registrar recepcionista' });
  }
};

exports.procesarReembolso = async (req, res) => {
  try {
    const pago = await Pago.findOne({ where: { FacturaId: req.params.facturaId } });
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    pago.estado = 'Reembolsado';
    await pago.save();
    res.json({ mensaje: 'Reembolso procesado', pago });
  } catch {
    res.status(500).json({ error: 'Error al procesar reembolso' });
  }
};

exports.anularFactura = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.facturaId);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    factura.anulada = true;
    await factura.save();
    res.json({ mensaje: 'Factura anulada', factura });
  } catch {
    res.status(500).json({ error: 'Error al anular factura' });
  }
};

exports.detectarDiscrepancias = async (_req, res) => {
  const facturas = await Factura.findAll({ include: Pago });
  const problemas = facturas.filter(f =>
    !f.Pago ||
    parseFloat(f.Pago.monto) !== parseFloat(f.monto) ||
    (f.anulada && f.Pago.estado === 'Completado')
  );
  res.json(problemas);
};
