// routes/recepcionista.routes.js
const express = require('express');
const router = express.Router();
const recepcionistaController = require('../controllers/recepcionista.controller');

router.post('/reservas', recepcionistaController.crearReservaRecepcionista);
router.patch('/check-in/:reservaId', recepcionistaController.realizarCheckInRecepcionista);
// ... otras rutas para el recepcionista que puedas añadir

module.exports = router;