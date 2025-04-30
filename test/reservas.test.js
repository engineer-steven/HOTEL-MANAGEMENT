const request = require('supertest');
const app = require('../server');
const db = require('../models');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

// Mock del middleware de autenticación
jest.mock('../middlewares/auth', () => ({
  verificarToken: (req, res, next) => {
    req.user = { rol: 'Recepcionista' };
    next();
  },
  soloRecepcionista: (req, res, next) => next(),
  soloSupervisor: (req, res, next) => next()
}));

jest.mock('../models', () => ({
  Reserva: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Habitacion: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Factura: {
    create: jest.fn()
  }
}));

describe('🏨 Pruebas del controlador de reservas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Crear una reserva', () => {
    it('debería crear una nueva reserva exitosamente', async () => {
      const reqBody = {
          HabitacionId: 1,
          HuespedId: 2,
        fechaEntrada: dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(32, 'day').format('YYYY-MM-DD HH:mm:ss'),
      };

      db.Habitacion.findByPk.mockResolvedValue({ id: 1, disponible: true });
      db.Reserva.create.mockResolvedValue({ id: 101, ...reqBody, estado: 'Confirmada' });
      db.Habitacion.update.mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', 'Bearer mock-token')
        .send(reqBody);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        mensaje: 'La reserva ha sido creada exitosamente',
        reserva: { id: 101, ...reqBody, estado: 'Confirmada' }
      });
      expect(db.Reserva.create).toHaveBeenCalledWith({ ...reqBody, estado: 'Confirmada' });
      expect(db.Habitacion.update).toHaveBeenCalledWith({ disponible: false }, { where: { id: 1 } });
    });

    it('debería devolver un error 400 si faltan datos requeridos', async () => {
      const reqBody = {
          HuespedId: 2,
        fechaEntrada: dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(32, 'day').format('YYYY-MM-DD HH:mm:ss'),
      };

      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', 'Bearer mock-token')
        .send(reqBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Por favor, complete todos los campos requeridos para la reserva.' });
    });

    it('debería devolver un error 400 si la habitación no está disponible', async () => {
      const reqBody = {
          HabitacionId: 1,
          HuespedId: 2,
        fechaEntrada: dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(32, 'day').format('YYYY-MM-DD HH:mm:ss'),
      };

      db.Habitacion.findByPk.mockResolvedValue({ id: 1, disponible: false });

      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', 'Bearer mock-token')
        .send(reqBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ mensaje: 'La habitación seleccionada no está disponible en este momento.' });
      expect(db.Reserva.create).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });

  describe('🔑 Realizar check-out', () => {
    it('debería realizar el check-out exitosamente y crear una factura', async () => {
      const reqBody = { metodoPago: 'Efectivo', monto: 100 };
      const mockReserva = {
        id: 100,
        estado: 'En curso',
        Habitacion: { 
          id: 1,
          update: jest.fn().mockResolvedValue([1])
        },
        update: jest.fn().mockResolvedValue([1])
      };

      db.Reserva.findByPk.mockResolvedValue(mockReserva);
      db.Factura.create.mockResolvedValue({ 
        id: 1, 
        ReservaId: '100', 
        metodoPago: 'Efectivo',
        monto: 100 
      });

      const response = await request(app)
        .post('/api/reservas/100/check-out')
        .set('Authorization', 'Bearer mock-token')
        .send(reqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        mensaje: 'Check-out realizado y factura generada exitosamente',
        factura: {
          id: 1,
          ReservaId: '100',
          metodoPago: 'Efectivo',
          monto: 100
        }
      });
      expect(mockReserva.update).toHaveBeenCalledWith({ estado: 'Finalizada' });
      expect(mockReserva.Habitacion.update).toHaveBeenCalledWith({ disponible: true });
      expect(db.Factura.create).toHaveBeenCalledWith({
        ReservaId: '100',
        metodoPago: 'Efectivo',
        monto: 100
      });
    });

    it('debería devolver un error 404 si la reserva no existe para el check-out', async () => {
      const reqBody = { metodoPago: 'Efectivo', monto: 100 };

      db.Reserva.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/reservas/100/check-out')
        .set('Authorization', 'Bearer mock-token')
        .send(reqBody);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ mensaje: 'No se encontró la reserva especificada para realizar el check-out.' });
      expect(db.Factura.create).not.toHaveBeenCalled();
    });
  });
});