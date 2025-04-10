const request = require('supertest');
const app = require('../server');
const db = require('../models');
const recepcionistaController = require('../controllers/recepcionista.controller');
const dayjs = require('dayjs');

jest.mock('../models');

describe('🏨 Pruebas del controlador de recepcionista', () => {
  let habitacion, huesped, reserva;

  beforeEach(async () => {
    db.Habitacion.create.mockResolvedValue({ id: 1, numero: '301', tipo: 'Simple', disponible: true });
    db.Huesped.create.mockResolvedValue({ id: 10, nombre: 'Laura Torres', documento: '55555555', correo: 'laura.torres@example.com' });
    db.Reserva.create.mockResolvedValue({
      id: 100,
      HabitacionId: 1,
      HuespedId: 10,
      fechaEntrada: dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Pendiente',
    });
    db.Habitacion.findByPk.mockResolvedValue({ id: 1, numero: '301', tipo: 'Simple', disponible: true });
    db.Huesped.findByPk.mockResolvedValue({ id: 10, nombre: 'Laura Torres', documento: '55555555', correo: 'laura.torres@example.com' });
    db.Reserva.findByPk.mockResolvedValue({
      id: 100,
      HabitacionId: 1,
      HuespedId: 10,
      fechaEntrada: dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Pendiente',
      Habitacion: { id: 1, numero: '301', tipo: 'Simple', disponible: true, update: jest.fn().mockResolvedValue([1]) },
      Huesped: { id: 10, nombre: 'Laura Torres', documento: '55555555', correo: 'laura.torres@example.com' },
      update: jest.fn().mockResolvedValue([1]),
    });
    db.Reserva.update.mockResolvedValue([1]);
    db.Habitacion.update.mockResolvedValue([1]);
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
      db.Reserva.create.mockResolvedValue({ id: 101, ...mockReq.body, estado: 'Confirmada' });
      db.Habitacion.findByPk.mockResolvedValueOnce({ id: 1, numero: '301', tipo: 'Simple', disponible: true, update: jest.fn().mockResolvedValue([1]) });

      await recepcionistaController.crearReservaRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva creada por recepcionista con éxito',
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
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos para la reserva.' });
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
      db.Habitacion.findByPk.mockResolvedValueOnce({ id: 1, numero: '301', tipo: 'Simple', disponible: false });

      await recepcionistaController.crearReservaRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'La habitación no está disponible.' });
      expect(db.Reserva.create).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });

  describe('🔑 Realizar check-in', () => {
    it('debería realizar el check-in exitosamente', async () => {
      const mockReq = {
        params: { reservaId: 100 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue({
        id: 100,
        HabitacionId: 1,
        HuespedId: 10,
        fechaEntrada: dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm:ss'),
        estado: 'Pendiente',
        Habitacion: { id: 1, numero: '301', tipo: 'Simple', disponible: true, update: jest.fn().mockResolvedValue([1]) },
        Huesped: { id: 10, nombre: 'Laura Torres' },
        update: jest.fn().mockResolvedValue([1]),
      });

      await recepcionistaController.realizarCheckInRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Check-in realizado con éxito',
        reserva: expect.any(Object),
      });
      expect(db.Reserva.findByPk).toHaveBeenCalledWith('100', { include: [db.Habitacion, db.Huesped] });
      expect(db.Reserva.findByPk.mock.calls[0][1].include).toEqual([db.Habitacion, db.Huesped]);
      expect(db.Reserva.findByPk.mock.results[0].value.update).toHaveBeenCalledWith({ estado: 'En curso' });
      expect(db.Reserva.findByPk.mock.results[0].value.Habitacion.update).toHaveBeenCalledWith({ disponible: false });
    });

    it('debería devolver un error 404 si la reserva no existe', async () => {
      const mockReq = {
        params: { reservaId: '999' },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue(null);

      await recepcionistaController.realizarCheckInRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'Reserva no encontrada.' });
    });

    it('debería devolver un error 400 si la habitación no está disponible', async () => {
      const mockReq = {
        params: { reservaId: 100 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue({
        id: 100,
        HabitacionId: 1,
        HuespedId: 10,
        fechaEntrada: dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm:ss'),
        estado: 'Pendiente',
        Habitacion: { id: 1, numero: '301', tipo: 'Simple', disponible: false },
        Huesped: { id: 10, nombre: 'Laura Torres' },
        update: jest.fn(),
      });

      await recepcionistaController.realizarCheckInRecepcionista(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'La habitación para esta reserva no está disponible.' });
      expect(db.Reserva.findByPk).toHaveBeenCalledWith('100', { include: [db.Habitacion, db.Huesped] });
      expect(db.Reserva.findByPk.mock.results[0].value.update).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });
});