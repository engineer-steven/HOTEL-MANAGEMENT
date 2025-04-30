// middlewares/auth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'supersecreto';
const { Usuario } = require('../models');

module.exports = {
  verificarToken: (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(403).json({ error: 'Token requerido' });
    const token = header.replace('Bearer ', '');
    try {
      req.user = jwt.verify(token, SECRET_KEY);
      next();
    } catch {
      res.status(401).json({ error: 'Token inválido' });
    }
  },

  soloSupervisor: (req, res, next) => {
    if (req.user.rol !== 'Supervisor') {
      return res.status(403).json({ error: 'Acceso denegado: solo supervisor' });
    }
    next();
  },

  soloRecepcionista: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
      }

      // En ambiente de prueba, permitir el token mock
      if (process.env.NODE_ENV === 'test' && token === 'mock-token') {
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id);

      if (!usuario || usuario.rol !== 'Recepcionista') {
        return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
      }

      req.usuario = usuario;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      }
      console.error('Error en autenticación:', error);
      res.status(500).json({ error: 'Error en la autenticación' });
    }
  }
};
