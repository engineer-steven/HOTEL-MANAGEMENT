// controllers/supervisor.controller.js
const { Empleado, Factura, Pago, Reserva, Habitacion } = require('../models');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const saltRounds = 10;

exports.registrarRecepcionista = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar si el correo ya existe
    const empleadoExistente = await Empleado.findOne({ where: { correo } });
    if (empleadoExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const recep = await Empleado.create({ 
      nombre, 
      correo, 
      password: hash, 
      rol: 'Recepcionista' 
    });
    res.status(201).json(recep);
  } catch (error) {
    console.error('Error al registrar recepcionista:', error);
    res.status(500).json({ error: 'Error al registrar recepcionista' });
  }
};

exports.procesarReembolso = async (req, res) => {
  try {
    const pago = await Pago.findOne({ 
      where: { FacturaId: req.params.facturaId },
      include: [{ 
        model: Factura,
        as: 'factura'
      }]
    });
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pago.estado === 'Reembolsado') {
      return res.status(400).json({ error: 'El pago ya ha sido reembolsado' });
    }

    await pago.update({ estado: 'Reembolsado' });

    if (pago.factura) {
      await pago.factura.update({ anulada: true });
    }

    res.json({ mensaje: 'Reembolso procesado', pago });
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    res.status(500).json({ error: 'Error al procesar reembolso' });
  }
};

exports.anularFactura = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.facturaId);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (factura.anulada) {
      return res.status(400).json({ error: 'La factura ya está anulada' });
    }

    await factura.update({ anulada: true });

    res.json({ mensaje: 'Factura anulada', factura });
  } catch (error) {
    console.error('Error al anular factura:', error);
    res.status(500).json({ error: 'Error al anular factura' });
  }
};

exports.detectarDiscrepancias = async (req, res) => {
  try {
    const facturas = await Factura.findAll({ 
      include: [{ 
        model: Pago,
        as: 'pagos',
        required: false 
      }] 
    });

    const problemas = facturas.filter(f => {
      if (!f.pagos || f.pagos.length === 0) return true;
      const totalPagado = f.pagos.reduce((sum, p) => sum + p.monto, 0);
      return Math.abs(totalPagado - f.monto) > 0.01 || (f.anulada && f.pagos.some(p => p.estado === 'Completado'));
    });

    res.json(problemas);
  } catch (error) {
    console.error('Error al detectar discrepancias:', error);
    res.status(500).json({ error: 'Error al detectar discrepancias' });
  }
};

exports.obtenerDashboard = async (req, res) => {
  try {
    const hoy = dayjs().startOf('day');
    const inicioMes = dayjs().startOf('month');

    // Obtener reservas de hoy
    const reservasHoy = await Reserva.count({
      where: {
        fechaEntrada: hoy.toDate()
      }
    });

    // Obtener habitaciones ocupadas
    const habitacionesOcupadas = await Habitacion.count({
      where: {
        disponible: false
      }
    });

    // Obtener ingresos mensuales
    const ingresosMensuales = await Factura.sum('monto', {
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: inicioMes.toDate()
        },
        anulada: false
      }
    });

    // Obtener facturas pendientes
    const facturasPendientes = await Factura.count({
      where: {
        estado: 'Pendiente',
        anulada: false
      }
    });

    res.json({
      reservasHoy,
      habitacionesOcupadas,
      ingresosMensuales: ingresosMensuales || 0,
      facturasPendientes
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

exports.generarReportes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    const inicio = dayjs(fechaInicio).startOf('day');
    const fin = dayjs(fechaFin).endOf('day');

    // Obtener estadísticas de ocupación
    const ocupacion = await Reserva.findAll({
      where: {
        fechaEntrada: {
          [db.Sequelize.Op.between]: [inicio.toDate(), fin.toDate()]
        }
      },
      include: [{
        model: Habitacion,
        attributes: ['numero', 'tipo']
      }]
    });

    // Obtener estadísticas de facturación
    const facturacion = await Factura.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [inicio.toDate(), fin.toDate()]
        },
        anulada: false
      },
      include: [{
        model: Pago,
        as: 'pagos'
      }]
    });

    // Calcular estadísticas
    const estadisticas = {
      periodoInicio: fechaInicio,
      periodoFin: fechaFin,
      ocupacionTotal: ocupacion.length,
      ingresoTotal: facturacion.reduce((sum, f) => sum + f.monto, 0),
      promedioOcupacion: ocupacion.length / dayjs(fechaFin).diff(fechaInicio, 'day'),
      facturasEmitidas: facturacion.length,
      facturasPagadas: facturacion.filter(f => f.pagos && f.pagos.length > 0).length
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al generar reportes:', error);
    res.status(500).json({ error: 'Error al generar reportes' });
  }
};
