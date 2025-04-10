// test/factura.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');
const facturaController = require('../controllers/factura.controller'); // <--- ¡VERIFICA LA RUTA!
const dayjs = require('dayjs');

jest.mock('../models');

describe('🧾 Facturación', () => {
  let habitacion, huesped, reservaConFactura, reservaSinFactura, factura;

  beforeEach(async () => {
    db.Habitacion.create.mockResolvedValue({ id: 3, numero: '201', tipo: 'Doble', disponible: false, tipoTarifa: 50 });
    db.Huesped.create.mockResolvedValue({ id: 4, nombre: 'Carlos López', documento: '98765432', correo: 'carlos.lopez@example.com' });
    db.Reserva.create.mockResolvedValueOnce({
      id: 200,
      HabitacionId: 3,
      HuespedId: 4,
      fechaEntrada: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Finalizada',
    });
    db.Reserva.create.mockResolvedValueOnce({
      id: 202,
      HabitacionId: 3,
      HuespedId: 4,
      fechaEntrada: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'En curso',
    });
    db.Habitacion.findByPk.mockResolvedValue({ id: 3, numero: '201', tipo: 'Doble', disponible: false, tipoTarifa: 50 });
    db.Huesped.findByPk.mockResolvedValue({ id: 4, nombre: 'Carlos López', documento: '98765432', correo: 'carlos.lopez@example.com' });
    db.Reserva.findByPk.mockResolvedValueOnce({
      id: 200,
      HabitacionId: 3,
      HuespedId: 4,
      fechaEntrada: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'Finalizada',
      Habitacion: { id: 3, numero: '201', tipo: 'Doble', tipoTarifa: 50 },
      Huesped: { id: 4, nombre: 'Carlos López' },
    });
    db.Reserva.findByPk.mockResolvedValueOnce(null); // Para prueba de reserva no encontrada
    db.Reserva.findByPk.mockResolvedValueOnce({ // Para prueba de check-out
      id: 202,
      HabitacionId: 3,
      HuespedId: 4,
      fechaEntrada: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      fechaSalida: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      estado: 'En curso',
      Habitacion: { id: 3, numero: '201', tipo: 'Doble', disponible: false, tipoTarifa: 50, update: jest.fn().mockResolvedValue([1]) },
      Huesped: { id: 4, nombre: 'Carlos López' },
      update: jest.fn().mockResolvedValue([1]),
    });
    db.Factura.create.mockResolvedValue({ id: 301, ReservaId: 202, monto: 150, metodoPago: 'Efectivo' });
    db.Factura.findAll.mockResolvedValue([]);
    db.Factura.findAll.mockResolvedValueOnce([{ id: 300, ReservaId: 200, monto: 150, createdAt: new Date(), Reserva: { HuespedId: 4 } }]);
    db.Factura.findAll.mockResolvedValueOnce([]); // Para huésped sin facturas
  });

  describe('🧾 Consultar facturas por huésped', () => {
    it('📄 Consultar facturas de un huésped después del check-out', async () => {
      const mockReq = {
        query: { HuespedId: 4 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Factura.findAll.mockResolvedValue([{ id: 300, ReservaId: 200, monto: 150, createdAt: new Date(), Reserva: { HuespedId: 4 } }]);

      await facturaController.obtenerFacturasPorHuesped(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([{ id: 300, ReservaId: 200, monto: 150, createdAt: expect.any(String), Reserva: { HuespedId: 4 } }]);
      expect(db.Factura.findAll).toHaveBeenCalledWith({
        where: { '$Reserva.HuespedId$': 4 },
        include: [{ model: db.Reserva, attributes: ['HuespedId'] }],
      });
    });

    it('📄 Consultar facturas de un huésped sin facturas', async () => {
      const mockReq = {
        query: { HuespedId: 5 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Factura.findAll.mockResolvedValue([]);

      await facturaController.obtenerFacturasPorHuesped(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
      expect(db.Factura.findAll).toHaveBeenCalledWith({
        where: { '$Reserva.HuespedId$': 5 },
        include: [{ model: db.Reserva, attributes: ['HuespedId'] }],
      });
    });

    it('📄 Debería devolver un error 400 si no se proporciona el ID del huésped', async () => {
      const mockReq = {
        query: {},
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await facturaController.obtenerFacturasPorHuesped(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Se requiere el ID del huésped para consultar las facturas.' });
      expect(db.Factura.findAll).not.toHaveBeenCalled();
    });
  });

  describe('📄 Realizar check-out y verificar la factura creada', () => {
    it('debería realizar el check-out y crear una factura con los datos correctos', async () => {
      const mockReq = {
        params: { reservaId: 202 },
        body: { metodoPago: 'Efectivo' }, // Simula el método de pago enviado
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue({
        id: 202,
        HabitacionId: 3,
        HuespedId: 4,
        fechaEntrada: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
        fechaSalida: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        estado: 'En curso',
        Habitacion: { id: 3, numero: '201', tipo: 'Doble', disponible: false, update: jest.fn().mockResolvedValue([1]), tipoTarifa: 50 },
        Huesped: { id: 4, nombre: 'Carlos López' },
        update: jest.fn().mockResolvedValue([1]),
      });
      db.Factura.create.mockResolvedValue({ id: 301, ReservaId: 202, monto: expect.any(Number), metodoPago: 'Efectivo' });

      await facturaController.realizarCheckOutYGenerarFactura(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'Check-out realizado y factura generada con éxito', factura: { id: 301, ReservaId: 202, monto: expect.any(Number), metodoPago: 'Efectivo' } });
      expect(db.Reserva.findByPk).toHaveBeenCalledWith('202', { include: [db.Habitacion, db.Huesped] });
      expect(db.Reserva.findByPk.mock.results[0].value.update).toHaveBeenCalledWith({ estado: 'Finalizada' });
      expect(db.Reserva.findByPk.mock.results[0].value.Habitacion.update).toHaveBeenCalledWith({ disponible: true });
      expect(db.Factura.create).toHaveBeenCalledWith({ ReservaId: 202, monto: expect.any(Number), metodoPago: 'Efectivo' });
    });

    it('debería devolver un error 404 si la reserva no existe para el check-out y facturación', async () => {
      const mockReq = {
        params: { reservaId: '999' },
        body: { metodoPago: 'Efectivo' }, // Simula el método de pago enviado
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Reserva.findByPk.mockResolvedValue(null);

      await facturaController.realizarCheckOutYGenerarFactura(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ mensaje: 'Reserva no encontrada para realizar el check-out y generar la factura.' });
      expect(db.Factura.create).not.toHaveBeenCalled();
    });
  });
});