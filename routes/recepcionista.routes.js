// routes/recepcionista.routes.js
const express = require('express');
const router = express.Router();
const recepcionistaController = require('../controllers/recepcionista.controller');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/recepcionista/dashboard:
 *   get:
 *     tags:
 *       - Recepcionista
 *     summary: Obtener dashboard del recepcionista
 *     description: Obtiene información relevante para el recepcionista
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
 *                 checkInsHoy:
 *                   type: integer
 *                 checkOutsHoy:
 *                   type: integer
 *                 habitacionesDisponibles:
 *                   type: integer
 *                 proximasLlegadas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reservaId:
 *                         type: integer
 *                       huespedNombre:
 *                         type: string
 *                       habitacion:
 *                         type: string
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.get('/dashboard', auth.soloRecepcionista, recepcionistaController.obtenerDashboard);

/**
 * @swagger
 * /api/recepcionista/check-in/{reservaId}:
 *   patch:
 *     tags:
 *       - Recepcionista
 *     summary: Realizar check-in
 *     description: Registra el check-in de una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Check-in realizado exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.patch('/check-in/:reservaId', auth.soloRecepcionista, recepcionistaController.realizarCheckInRecepcionista);

/**
 * @swagger
 * /api/recepcionista/reservas:
 *   post:
 *     tags:
 *       - Recepcionista
 *     summary: Crear reserva
 *     description: Crea una nueva reserva desde recepción
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - HabitacionId
 *               - HuespedId
 *               - fechaEntrada
 *               - fechaSalida
 *             properties:
 *               HabitacionId:
 *                 type: integer
 *               HuespedId:
 *                 type: integer
 *               fechaEntrada:
 *                 type: string
 *                 format: date
 *               fechaSalida:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.post('/reservas', auth.soloRecepcionista, recepcionistaController.crearReservaRecepcionista);

module.exports = router;