// server.js
require('dotenv').config();
const express = require('express');
const app = express();

const reservasRoutes = require('./routes/reservas.routes');
const supervisorRoutes = require('./routes/supervisor.routes');
const recepcionistaRoutes = require('./routes/recepcionista.routes'); // Importa las rutas del recepcionista

app.use(express.json());
app.use('/api/reservas', reservasRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/recepcionista', recepcionistaRoutes); // Monta las rutas del recepcionista

module.exports = app;