// routes/supervisor.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/supervisor.controller');

router.use(auth.verificarToken, auth.soloSupervisor);

router.post('/recepcionistas', ctrl.registrarRecepcionista);
router.post('/reembolsos/:facturaId', ctrl.procesarReembolso);
router.post('/facturas/:facturaId/anular', ctrl.anularFactura);
router.get('/discrepancias', ctrl.detectarDiscrepancias);

module.exports = router;
