// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');
const rateLimit = require('express-rate-limit');
const testConfig = require('./config/test.config');
const app = express();
const db = require('./models');

console.log('Iniciando servidor...');

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente después de 15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Aplicar rate limiting a todas las rutas
app.use(limiter);

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
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
let server;

const startServer = async () => {
  try {
    // Sincronizar base de datos
    await db.sequelize.sync();
    console.log('Base de datos sincronizada correctamente');

    // Iniciar servidor
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} está en uso. Intentando con otro puerto...`);
        server.close();
        // Intentar con otro puerto
        server = app.listen(0, '0.0.0.0', () => {
          const newPort = server.address().port;
          console.log(`Servidor corriendo en http://localhost:${newPort}`);
          console.log(`Documentación disponible en http://localhost:${newPort}/api-docs`);
        });
      } else {
        console.error('Error en el servidor:', error);
        process.exit(1);
      }
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;