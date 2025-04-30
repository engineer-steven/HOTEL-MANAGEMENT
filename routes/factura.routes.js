const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const facturaController = require('../controllers/factura.controller');

router.use(auth.verificarToken);

// Middleware para validar huespedId
const validarHuespedId = (req, res, next) => {
  if (req.path === '/huesped/' || !req.params.huespedId || req.params.huespedId.trim() === '') {
    return res.status(400).json({ error: 'Se requiere el ID del huésped para consultar las facturas.' });
  }
  next();
};

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     tags:
 *       - Facturas
 *     summary: Consultar todas las facturas
 *     description: Obtiene todas las facturas del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas
 *       401:
 *         description: No autorizado
 */
router.get('/', facturaController.consultarFacturas);

/**
 * @swagger
 * /api/facturas/huesped/{huespedId}:
 *   get:
 *     tags:
 *       - Facturas
 *     summary: Consultar facturas por huésped
 *     description: Obtiene las facturas asociadas a un huésped específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: huespedId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de facturas del huésped
 *       400:
 *         description: ID de huésped no proporcionado
 *       404:
 *         description: Huésped no encontrado
 */
router.get('/huesped/:huespedId', validarHuespedId, facturaController.consultarFacturasPorHuesped);
router.get('/huesped/', validarHuespedId, facturaController.consultarFacturasPorHuesped);

/**
 * @swagger
 * /api/facturas/checkout/{reservaId}:
 *   post:
 *     tags:
 *       - Facturas
 *     summary: Realizar check-out y generar factura
 *     description: Realiza el check-out de una reserva y genera la factura correspondiente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Check-out realizado y factura generada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */
router.post('/checkout/:reservaId', facturaController.realizarCheckOutYGenerarFactura);

/**
 * @swagger
 * /api/facturas/{facturaId}/anular:
 *   put:
 *     tags:
 *       - Facturas
 *     summary: Anular una factura
 *     description: Anula una factura existente (solo supervisor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura anulada exitosamente
 *       403:
 *         description: No tiene permisos de supervisor
 *       404:
 *         description: Factura no encontrada
 */
router.put('/:facturaId/anular', auth.soloSupervisor, facturaController.anularFactura);

/**
 * @swagger
 * /api/facturas/{facturaId}:
 *   get:
 *     tags:
 *       - Facturas
 *     summary: Consultar una factura específica
 *     description: Obtiene los detalles de una factura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la factura
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:facturaId', facturaController.consultarFactura);

module.exports = router; 