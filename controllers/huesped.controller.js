const { Huesped } = require('../models');

exports.registrarHuesped = async (req, res) => {
  try {
    const { nombre, documento, correo } = req.body;

    if (!nombre || !documento) {
      return res.status(400).json({ error: 'Nombre y documento son campos requeridos.' });
    }

    const huesped = await Huesped.create({
      nombre,
      documento,
      correo
    });

    return res.status(201).json({
      mensaje: 'Huésped registrado exitosamente',
      huesped
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un huésped con este documento.' });
    }
    console.error('Error al registrar huésped:', error);
    return res.status(500).json({ error: 'Ocurrió un error al registrar el huésped.' });
  }
};

exports.obtenerHuespedes = async (req, res) => {
  try {
    const huespedes = await Huesped.findAll();
    return res.status(200).json({ huespedes });
  } catch (error) {
    console.error('Error al obtener huéspedes:', error);
    return res.status(500).json({ error: 'Ocurrió un error al obtener los huéspedes.' });
  }
}; 