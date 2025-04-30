const express = require('express');
const router = express.Router();
const huespedController = require('../controllers/huesped.controller');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/huespedes:
 *   post:
 *     tags:
 *       - Huéspedes
 *     summary: Registrar un nuevo huésped
 *     description: Crea un nuevo registro de huésped en el sistema (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - documento
 *               - email
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               documento:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Huésped registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.post('/', auth.soloRecepcionista, huespedController.registrarHuesped);

/**
 * @swagger
 * /api/huespedes:
 *   get:
 *     tags:
 *       - Huéspedes
 *     summary: Obtener todos los huéspedes
 *     description: Retorna la lista de todos los huéspedes registrados (solo recepcionista)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de huéspedes
 *       403:
 *         description: No tiene permisos de recepcionista
 */
router.get('/', auth.soloRecepcionista, huespedController.obtenerHuespedes);

module.exports = router; 