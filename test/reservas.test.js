const request = require('supertest');
const app = require('../server');
const db = require('../models');
const reservasController = require('../controllers/reservas.controller');
const dayjs = require('dayjs');

jest.mock('../models');

describe('📅 Pruebas del controlador de reservas', () => {
  let habitacion, huesped, reserva;

  beforeEach(async () => {
    db.Habitacion.create.mockResolvedValue({ id: 1, numero: '101', tipo: 'Doble', disponible: true, tipoTarifa: 50 });
    db.Huesped.create.mockResolvedValue({ id: 2, nombre: 'Juan Perez', documento: '12345678', correo: 'juan.perez@example.com' });
    db.Reserva.create.mockResolvedValue({
      id: 100,
      HabitacionId: 1,
      HuespedId: 2,
      fechaEntrada: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Pendiente',
    });
    db.Habitacion.findByPk.mockResolvedValue({ id: 1, numero: '101', tipo: 'Doble', disponible: true, tipoTarifa: 50 });
    db.Huesped.findByPk.mockResolvedValue({ id: 2, nombre: 'Juan Perez', documento: '12345678', correo: 'juan.perez@example.com' });
    db.Reserva.findByPk.mockResolvedValue({
      id: 100,
      HabitacionId: 1,
      HuespedId: 2,
      fechaEntrada: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Pendiente',
      Habitacion: { id: 1, numero: '101', tipo: 'Doble', disponible: true, tipoTarifa: 50 },
      Huesped: { id: 2, nombre: 'Juan Perez', documento: '12345678', correo: 'juan.perez@example.com' },
    });
    db.Reserva.update.mockResolvedValue([1]);
    db.Habitacion.update.mockResolvedValue([1]);
    db.Factura.create.mockResolvedValue({ id: 201, ReservaId: 100, monto: 200, metodoPago: 'Efectivo' });
    db.Factura.findAll.mockResolvedValue([]);
    db.Pago.create.mockResolvedValue({ id: 301, FacturaId: 201, monto: 200 });
    db.Pago.findAll.mockResolvedValue([]);
  });

  describe('✅ Crear una reserva', () => {
    it('debería crear una nueva reserva exitosamente', async () => {
      const mockReq = {
        body: {
          HabitacionId: 1,
          HuespedId: 2,
          fechaEntrada: dayjs().add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.create.mockResolvedValue({ id: 101, ...mockReq.body, estado: 'Confirmada' });
      db.Habitacion.findByPk.mockResolvedValueOnce({ id: 1, numero: '101', tipo: 'Doble', disponible: true, tipoTarifa: 50, update: jest.fn().mockResolvedValue([1]) }); // Mock para la actualización de disponibilidad

      await reservasController.crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva creada con éxito',
        reserva: { id: 101, ...mockReq.body, estado: 'Confirmada' },
      });
      expect(db.Reserva.create).toHaveBeenCalledWith({ ...mockReq.body, estado: 'Pendiente' });
      expect(db.Habitacion.update).toHaveBeenCalledWith({ disponible: false }, { where: { id: 1 } });
    });

    it('debería devolver un error 400 si faltan datos requeridos', async () => {
      const mockReq = {
        body: {
          HuespedId: 2,
          fechaEntrada: dayjs().add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await reservasController.crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos para la reserva.' });
    });

    it('debería devolver un error 400 si la habitación no está disponible', async () => {
      const mockReq = {
        body: {
          HabitacionId: 1,
          HuespedId: 2,
          fechaEntrada: dayjs().add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
          fechaSalida: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Habitacion.findByPk.mockResolvedValueOnce({ id: 1, numero: '101', tipo: 'Doble', disponible: false });

      await reservasController.crearReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'La habitación no está disponible.' });
      expect(db.Reserva.create).not.toHaveBeenCalled();
      expect(db.Habitacion.update).not.toHaveBeenCalled();
    });
  });

  describe('🚪 Realizar check-out', () => {
    it('debería realizar el check-out exitosamente y crear una factura', async () => {
      const mockReq = {
        params: { reservaId: 100 },
        body: { metodoPago: 'Efectivo' }, // Simula el envío del método de pago
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue({
        id: 100,
        HabitacionId: 1,
        HuespedId: 2,
        fechaEntrada: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().subtract(0, 'day').format('YYYY-MM-DD HH:mm:ss'),
        estado: 'En curso',
        Habitacion: { id: 1, numero: '101', tipo: 'Doble', disponible: false, tipoTarifa: 50, update: jest.fn().mockResolvedValue([1]) },
        Huesped: { id: 2, nombre: 'Juan Perez' },
        update: jest.fn().mockResolvedValue([1]),
      });
      db.Factura.create.mockResolvedValue({ id: 201, ReservaId: 100, monto: expect.any(Number), metodoPago: 'Efectivo' });

      await reservasController.realizarCheckOut(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'Check-out realizado con éxito', factura: expect.any(Object) });
      expect(db.Reserva.findByPk).toHaveBeenCalledWith('100', { include: [db.Habitacion, db.Huesped] });
      expect(db.Reserva.findByPk.mock.results[0].value.update).toHaveBeenCalledWith({ estado: 'Finalizada' });
      expect(db.Reserva.findByPk.mock.results[0].value.Habitacion.update).toHaveBeenCalledWith({ disponible: true });
      expect(db.Factura.create).toHaveBeenCalledWith({ ReservaId: 100, monto: expect.any(Number), metodoPago: 'Efectivo' });
    });

    it('debería devolver un error 404 si la reserva no existe para el check-out', async () => {
      const mockReq = {
        params: { reservaId: '999' },
        body: { metodoPago: 'Efectivo' }, // Simula el envío del método de pago
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue(null);

      await reservasController.realizarCheckOut(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'Reserva no encontrada para realizar el check-out.' });
      expect(db.Factura.create).not.toHaveBeenCalled();
    });
  });
});