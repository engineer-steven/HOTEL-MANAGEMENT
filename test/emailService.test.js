const emailService = require('../src/services/emailService');
const nodemailer = require('nodemailer');
const db = require('../src/database');

// Mock de nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({
            messageId: 'test-message-id'
        })
    })
}));

// Mock de la base de datos
jest.mock('../src/database', () => ({
    get: jest.fn()
}));

// Configurar variables de entorno
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';

describe('Email Service', () => {
    beforeEach(() => {
        // Limpiar los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    describe('sendReservationConfirmation', () => {
        it('should send a reservation confirmation email successfully', async () => {
            const reservation = {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                fecha_entrada: '2024-03-01',
                fecha_salida: '2024-03-05',
                habitacion_id: 101
            };

            const result = await emailService.sendReservationConfirmation(reservation);

            // Verificar que se llamó a sendMail con los parámetros correctos
            expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
                from: process.env.EMAIL_USER,
                to: reservation.email,
                subject: 'Confirmación de Reserva',
                html: expect.stringContaining(reservation.nombre)
            });

            // Verificar que se devuelve el resultado correcto
            expect(result).toEqual({ messageId: 'test-message-id' });
        });

        it('should handle email sending errors', async () => {
            const error = new Error('Error de envío');
            nodemailer.createTransport().sendMail.mockRejectedValueOnce(error);

            const reservation = {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                fecha_entrada: '2024-03-01',
                fecha_salida: '2024-03-05',
                habitacion_id: 101
            };

            await expect(emailService.sendReservationConfirmation(reservation))
                .rejects
                .toThrow(error);
        });
    });

    describe('sendPaymentConfirmation', () => {
        it('should send a payment confirmation email successfully', async () => {
            const invoice = {
                id: 1,
                reserva_id: 1,
                monto: 1000,
                metodo_pago: 'Tarjeta de Crédito',
                fecha_creacion: '2024-02-20'
            };

            const mockReservation = {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@example.com'
            };

            // Configurar el mock de la base de datos
            db.get.mockImplementation((query, params, callback) => {
                callback(null, mockReservation);
            });

            const result = await emailService.sendPaymentConfirmation(invoice);

            // Verificar que se llamó a la base de datos
            expect(db.get).toHaveBeenCalledWith(
                'SELECT * FROM reservas WHERE id = ?',
                [invoice.reserva_id],
                expect.any(Function)
            );

            // Verificar que se llamó a sendMail con los parámetros correctos
            expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
                from: process.env.EMAIL_USER,
                to: mockReservation.email,
                subject: 'Confirmación de Pago',
                html: expect.stringContaining(invoice.monto.toString())
            });

            // Verificar que se devuelve el resultado correcto
            expect(result).toEqual({ messageId: 'test-message-id' });
        });

        it('should handle database errors', async () => {
            const invoice = {
                id: 1,
                reserva_id: 1,
                monto: 1000,
                metodo_pago: 'Tarjeta de Crédito',
                fecha_creacion: '2024-02-20'
            };

            const dbError = new Error('Error de base de datos');
            db.get.mockImplementation((query, params, callback) => {
                callback(dbError, null);
            });

            await expect(emailService.sendPaymentConfirmation(invoice))
                .rejects
                .toThrow(dbError);
        });

        it('should handle missing reservation data', async () => {
            const invoice = {
                id: 1,
                reserva_id: 1,
                monto: 1000,
                metodo_pago: 'Tarjeta de Crédito',
                fecha_creacion: '2024-02-20'
            };

            db.get.mockImplementation((query, params, callback) => {
                callback(null, null);
            });

            await expect(emailService.sendPaymentConfirmation(invoice))
                .rejects
                .toThrow('Reserva no encontrada');
        });

        it('should handle email sending errors after successful database query', async () => {
            const invoice = {
                id: 1,
                reserva_id: 1,
                monto: 1000,
                metodo_pago: 'Tarjeta de Crédito',
                fecha_creacion: '2024-02-20'
            };

            const mockReservation = {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@example.com'
            };

            const emailError = new Error('Error al enviar correo');

            // Configurar el mock de la base de datos
            db.get.mockImplementation((query, params, callback) => {
                callback(null, mockReservation);
            });

            // Simular error al enviar el correo
            nodemailer.createTransport().sendMail.mockRejectedValueOnce(emailError);

            await expect(emailService.sendPaymentConfirmation(invoice))
                .rejects
                .toThrow(emailError);
        });
    });
}); 