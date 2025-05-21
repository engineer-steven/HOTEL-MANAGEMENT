const { Notificacion, Reserva } = require('../models');
const { Op } = require('sequelize');

const notificacionController = {
    
    // Crear una nueva notificación
    async crearNotificacion(req, res) {
        try {
            const { mensaje, tipo, datos } = req.body;

            if (!mensaje || !tipo || !datos) {
                return res.status(400).json({
                    error: 'Faltan datos requeridos (mensaje, tipo, datos)'
                });
            }

            const notificacion = await Notificacion.create({
                mensaje,
                tipo,
                datos,
                estado: 'pendiente'
            });

            res.status(201).json({
                message: 'Notificación creada exitosamente',
                notificacion
            });

        } catch (error) {
            console.error('Error al crear notificación:', error);
            res.status(500).json({
                error: 'Error interno del servidor al crear la notificación'
            });
        }
    },

    // Obtener todas las notificaciones
    async obtenerNotificaciones(req, res) {
        try {
            const notificaciones = await Notificacion.findAll({
                order: [['fechaCreacion', 'DESC']]
            });

            res.json(notificaciones);

        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            res.status(500).json({
                error: 'Error interno del servidor al obtener las notificaciones'
            });
        }
    },

    // Obtener notificaciones pendientes
    async obtenerNotificacionesPendientes(req, res) {
        try {
            const notificaciones = await Notificacion.findAll({
                where: {
                    estado: 'pendiente'
                },
                order: [['fechaCreacion', 'DESC']]
            });

            res.json(notificaciones);

        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            res.status(500).json({
                error: 'Error interno del servidor al obtener las notificaciones'
            });
        }
    },

    // Marcar notificación como leída
    async marcarComoLeida(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la notificación existe
            const notificacion = await Notificacion.findByPk(id);

            if (!notificacion) {
                return res.status(404).json({
                    error: 'Notificación no encontrada'
                });
            }

            // Actualizar el campo leida de la notificación
            await notificacion.update({ leida: true });

            res.json({
                message: 'Notificación marcada como leída exitosamente',
                notificacion
            });

        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            res.status(500).json({
                error: 'Error interno del servidor al marcar la notificación como leída'
            });
        }
    },

    // Actualizar estado de notificación
    async actualizarEstadoNotificacion(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Verificar si la notificación existe
            const notificacion = await Notificacion.findByPk(id);

            if (!notificacion) {
                return res.status(404).json({
                    error: 'Notificación no encontrada'
                });
            }

            // Verificar si la notificación ya fue procesada
            if (notificacion.estado !== 'pendiente') {
                return res.status(400).json({
                    error: 'Esta notificación ya fue procesada'
                });
            }

            // Actualizar el estado de la notificación
            await notificacion.update({ estado });

            res.json({
                message: 'Estado de notificación actualizado exitosamente',
                notificacion
            });

        } catch (error) {
            console.error('Error al actualizar notificación:', error);
            res.status(500).json({
                error: 'Error interno del servidor al actualizar la notificación'
            });
        }
    }
};

module.exports = notificacionController; 