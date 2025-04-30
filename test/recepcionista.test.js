const request = require('supertest');
const app = require('../server');
const db = require('../models');
const recepcionistaController = require('../controllers/recepcionista.controller');
const dayjs = require('dayjs');

jest.mock('../models', () => ({
  Reserva: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Habitacion: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Huesped: {
    create: jest.fn(),
    findByPk: jest.fn()
  }
}));

describe('🏨 Pruebas del controlador de recepcionista', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Crear una reserva por recepcionista', () => {
    it('debería crear una nueva reserva exitosamente', async () => {
      const mockReq = {
        body: {
          HabitacionId: 1,
          HuespedId: 10,
          fechaEntrada: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.Habitacion.findByPk.mockResolvedValue({ id: 1, numero: '301', tipo: 'Simple', disponible: true });
      db.Reserva.create.mockResolvedValue({ id: 101, ...mockReq.body, estado: 'Confirmada' });
      db.Habitacion.update.mockResolvedValue([1]);

      await recepcionistaController.crearReservaRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La reserva ha sido creada exitosamente',
        reserva: { id: 101, ...mockReq.body, estado: 'Confirmada' },
      });
      expect(db.Reserva.create).toHaveBeenCalledWith({ ...mockReq.body, estado: 'Confirmada' });
      expect(db.Habitacion.update).toHaveBeenCalledWith({ disponible: false }, { where: { id: 1 } });
    });

    it('debería devolver un error 400 si faltan datos requeridos', async () => {
      const mockReq = {
        body: {
          HuespedId: 10,
          fechaEntrada: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await recepcionistaController.crearReservaRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Por favor, complete todos los campos requeridos para la reserva.' });
    });

    it('debería devolver un error 400 si la habitación no está disponible', async () => {
      const mockReq = {
        body: {
          HabitacionId: 1,
          HuespedId: 10,
          fechaEntrada: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.Habitacion.findByPk.mockResolvedValue({ id: 1, numero: '301', tipo: 'Simple', disponible: false });

      await recepcionistaController.crearReservaRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'La habitación seleccionada no está disponible en este momento.' });
      expect(db.Reserva.create).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });

  describe('🔑 Realizar check-in', () => {
    it('debería realizar el check-in exitosamente', async () => {
      const mockReq = {
        params: { reservaId: '100' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockReserva = {
        id: 100,
        HabitacionId: 1,
        HuespedId: 10,
        estado: 'Pendiente',
        Habitacion: { id: 1, disponible: true },
        Huesped: { id: 10, nombre: 'Test User' }
      };

      db.Reserva.findByPk.mockResolvedValue(mockReserva);
      db.Reserva.update.mockResolvedValue([1]);
      db.Habitacion.update.mockResolvedValue([1]);

      await recepcionistaController.realizarCheckInRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Check-in realizado con éxito',
        reserva: mockReserva
      });
      expect(db.Reserva.findByPk).toHaveBeenCalledWith('100', { include: [db.Habitacion, db.Huesped] });
      expect(db.Reserva.update).toHaveBeenCalledWith({ estado: 'En curso' }, { where: { id: '100' } });
      expect(db.Habitacion.update).toHaveBeenCalledWith({ disponible: false }, { where: { id: 1 } });
    });

    it('debería devolver un error 400 si la habitación no está disponible', async () => {
      const mockReq = {
        params: { reservaId: '100' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockReserva = {
        id: 100,
        HabitacionId: 1,
        HuespedId: 10,
        estado: 'Pendiente',
        Habitacion: { id: 1, disponible: false },
        Huesped: { id: 10, nombre: 'Test User' }
      };

      db.Reserva.findByPk.mockResolvedValue(mockReserva);

      await recepcionistaController.realizarCheckInRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'La habitación para esta reserva no está disponible.' });
      expect(db.Reserva.update).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });
});