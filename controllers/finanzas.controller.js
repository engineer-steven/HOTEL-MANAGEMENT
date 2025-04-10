
const { Pago } = require('../models');

exports.monitorearTransacciones = async (req, res) => {
  try {
    const transacciones = await Pago.findAll();
    res.status(200).json(transacciones);
  } catch (error) {
    console.error('❌ Error al monitorear transacciones:', error);
    res.status(500).json({ error: 'No se pudieron obtener las transacciones' });
  }
};

exports.detectarDiscrepancias = async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    const discrepancias = pagos.filter(p => p.monto < 0 || p.metodoPago === null);

    res.status(200).json({ discrepancias });
  } catch (error) {
    console.error('❌ Error al detectar discrepancias:', error);
    res.status(500).json({ error: 'Error detectando discrepancias' });
  }
};

exports.generarAlertasFraude = async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    const alertas = pagos.filter(p => p.monto > 10000);
    res.status(200).json({ alertas });
  } catch (error) {
    console.error('❌ Error al generar alertas de fraude:', error);
    res.status(500).json({ error: 'Error al generar alertas' });
  }
};
