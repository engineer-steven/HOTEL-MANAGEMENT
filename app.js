const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const notificacionRoutes = require('./routes/notificacion.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/notificaciones', notificacionRoutes);

module.exports = app; 