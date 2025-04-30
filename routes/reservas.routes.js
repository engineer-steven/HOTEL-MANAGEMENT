// routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reservas.controller');

router.use(auth.verificarToken);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     tags:
 *       - Reservas
 *     summary: Crear una nueva reserva
 *     description: Crea una nueva reserva (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaInicio
 *               - fechaFin
 *               - habitacionId
 *               - huespedId
 *             properties:
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaFin:
 *                 type: string
 *                 format: date
 *               habitacionId:
 *                 type: integer
 *               huespedId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.post('/', auth.soloRecepcionista, ctrl.crearReserva);

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener todas las reservas
 *     description: Retorna todas las reservas del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 *       401:
 *         description: No autorizado
 */
router.get('/', ctrl.obtenerReservas);

/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener una reserva por ID
 *     description: Retorna los detalles de una reserva específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la reserva
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', ctrl.obtenerReservaPorId);

/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     tags:
 *       - Reservas
 *     summary: Actualizar una reserva
 *     description: Actualiza los detalles de una reserva (solo supervisor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaFin:
 *                 type: string
 *                 format: date
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmada, cancelada]
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       403:
 *         description: No tiene permisos de supervisor
 */
router.put('/:id', auth.soloSupervisor, ctrl.actualizarReserva);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     tags:
 *       - Reservas
 *     summary: Eliminar una reserva
 *     description: Elimina una reserva del sistema (solo supervisor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       403:
 *         description: No tiene permisos de supervisor
 */
router.delete('/:id', auth.soloSupervisor, ctrl.eliminarReserva);

/**
 * @swagger
 * /api/reservas/{reservaId}/check-out:
 *   post:
 *     tags:
 *       - Reservas
 *     summary: Realizar check-out
 *     description: Registra el check-out de una reserva (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-out realizado exitosamente
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.post('/:reservaId/check-out', auth.soloRecepcionista, ctrl.realizarCheckOut);

/**
 * @swagger
 * /api/reservas/facturas-huesped/{documento}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Consultar facturas de un huésped
 *     description: Obtiene las facturas asociadas a un huésped por su documento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de facturas del huésped
 *       404:
 *         description: Huésped no encontrado
 */
router.get('/facturas-huesped/:documento', ctrl.consultarFacturasHuesped);

/**
 * @swagger
 * /api/reservas/habitaciones/disponibles:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Verificar disponibilidad de habitaciones
 *     description: Verifica las habitaciones disponibles para un rango de fechas (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de habitaciones disponibles
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.get('/habitaciones/disponibles', auth.soloRecepcionista, ctrl.verificarDisponibilidad);

/**
 * @swagger
 * /api/reservas/huesped/{documento}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Buscar huésped por documento
 *     description: Busca un huésped por su número de documento (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información del huésped
 *       404:
 *         description: Huésped no encontrado
 */
router.get('/huesped/:documento', auth.soloRecepcionista, ctrl.buscarHuesped);

module.exports = router;
