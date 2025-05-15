const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt';

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const soloSupervisor = (req, res, next) => {
  const usuario = req.usuario || req.user;
  if (!usuario) return res.status(401).json({ error: 'Usuario no autenticado' });
  if (usuario.rol !== 'supervisor') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de supervisor' });
  }
  next();
};

const soloRecepcionista = (req, res, next) => {
  const usuario = req.usuario || req.user;
  if (!usuario) return res.status(401).json({ error: 'Usuario no autenticado' });
  if (usuario.rol !== 'recepcionista') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de recepcionista' });
  }
  next();
};

module.exports = {
  verificarToken,
  soloSupervisor,
  soloRecepcionista
}; 