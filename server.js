// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');
const app = express();
const db = require('./models');

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));

// Rutas
const authRoutes = require('./routes/auth.routes');
const reservasRoutes = require('./routes/reservas.routes');
const facturaRoutes = require('./routes/factura.routes');
const recepcionistaRoutes = require('./routes/recepcionista.routes');
const supervisorRoutes = require('./routes/supervisor.routes');
const huespedRoutes = require('./routes/huesped.routes');

// Prefijo /api para todas las rutas
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/recepcionista', recepcionistaRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/huespedes', huespedRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Hotel Management',
    docs: 'Visita /api-docs para ver la documentación'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

// Sincronizar base de datos y luego iniciar servidor
db.sequelize.sync()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

module.exports = app;