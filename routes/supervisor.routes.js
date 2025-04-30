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

/**
 * @swagger
 * /api/supervisor/dashboard:
 *   get:
 *     tags:
 *       - Supervisor
 *     summary: Obtener dashboard del supervisor
 *     description: Obtiene estadísticas y datos relevantes para el supervisor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservasHoy:
 *                   type: integer
 *                 habitacionesOcupadas:
 *                   type: integer
 *                 ingresosMensuales:
 *                   type: number
 *                 facturasPendientes:
 *                   type: integer
 *       403:
 *         description: No tiene permisos de supervisor
 */
router.get('/dashboard', ctrl.obtenerDashboard);

/**
 * @swagger
 * /api/supervisor/reportes:
 *   get:
 *     tags:
 *       - Supervisor
 *     summary: Generar reportes
 *     description: Genera reportes de ocupación y facturación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio del reporte
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha fin del reporte
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       403:
 *         description: No tiene permisos de supervisor
 */
router.get('/reportes', ctrl.generarReportes);

module.exports = router;
