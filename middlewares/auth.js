// middlewares/auth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'supersecreto';

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

  soloRecepcionista: (req, res, next) => {
    if (req.user.rol !== 'Recepcionista') {
      return res.status(403).json({ error: 'Acceso denegado: solo recepcionista' });
    }
    next();
  }
};
