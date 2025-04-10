// routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reservas.controller');

router.use(auth.verificarToken);

router.post('/', auth.soloRecepcionista, ctrl.crearReserva);
router.get('/', ctrl.obtenerReservas);
router.get('/:id', ctrl.obtenerReservaPorId);
router.put('/:id', auth.soloSupervisor, ctrl.actualizarReserva);
router.delete('/:id', auth.soloSupervisor, ctrl.eliminarReserva);

router.post('/checkout/:id', auth.soloRecepcionista, ctrl.realizarCheckOut);
router.get('/facturas-huesped/:documento', ctrl.consultarFacturasHuesped);

router.get('/habitaciones/disponibles', auth.soloRecepcionista, ctrl.verificarDisponibilidad);
router.get('/huesped/:documento', auth.soloRecepcionista, ctrl.buscarHuesped);

module.exports = router;
