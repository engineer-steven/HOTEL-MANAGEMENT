const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacion.controller');
const { verificarToken, esSupervisor } = require('../middleware/auth');

/**
 * @swagger
 * /api/notificaciones:
 *   get:
 *     tags:
 *       - Notificaciones
 *     summary: Obtener notificaciones
 *     description: Obtiene todas las notificaciones del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   mensaje:
 *                     type: string
 *                   leida:
 *                     type: boolean
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 */
router.get('/', verificarToken, notificacionController.obtenerNotificaciones);

/**
 * @swagger
 * /api/notificaciones/{id}/marcar-leida:
 *   put:
 *     tags:
 *       - Notificaciones
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación específica como leída
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 *       401:
 *         description: No autorizado
 */
router.put('/:id/marcar-leida', verificarToken, notificacionController.marcarComoLeida);

// Rutas para recepcionistas
router.post('/', verificarToken, notificacionController.crearNotificacion);

// Rutas para supervisores
router.get('/pendientes', verificarToken, esSupervisor, notificacionController.obtenerNotificacionesPendientes);
router.put('/:id/estado', verificarToken, esSupervisor, notificacionController.actualizarEstadoNotificacion);

module.exports = router; 