// test/factura.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
  Factura: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Reserva: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Huesped: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  }
}));

jest.mock('../middlewares/auth', () => ({
  verificarToken: jest.fn((req, res, next) => {
    req.user = { id: 1, rol: 'Recepcionista' };
    next();
  }),
  soloRecepcionista: jest.fn((req, res, next) => next()),
  soloSupervisor: jest.fn((req, res, next) => next())
}));

describe('Controlador de Facturas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /facturas', () => {
    it('debería obtener todas las facturas', async () => {
      const mockFacturas = [{ id: 1, total: 100 }];
      db.Factura.findAll.mockResolvedValue(mockFacturas);

      const response = await request(app)
        .get('/api/facturas')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFacturas);
    });

    it('debería manejar errores al obtener facturas', async () => {
      db.Factura.findAll.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/facturas')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudieron obtener las facturas');
    });
  });

  describe('GET /facturas/huesped/:huespedId', () => {
    it('debería obtener facturas por huésped', async () => {
      const mockFacturas = [{ id: 1, total: 100 }];
      db.Factura.findAll.mockResolvedValue(mockFacturas);

      const response = await request(app)
        .get('/api/facturas/huesped/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFacturas);
    });

    it('debería retornar error si falta el ID del huésped', async () => {
      const response = await request(app)
        .get('/api/facturas/huesped/')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Se requiere el ID del huésped para consultar las facturas.');
    });

    it('debería manejar errores al obtener facturas por huésped', async () => {
      db.Factura.findAll.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/facturas/huesped/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudieron recuperar las facturas. Por favor, intente nuevamente.');
    });
  });

  describe('GET /facturas/:facturaId', () => {
    it('debería obtener una factura específica', async () => {
      const mockFactura = { id: 1, total: 100 };
      db.Factura.findByPk.mockResolvedValue(mockFactura);

      const response = await request(app)
        .get('/api/facturas/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFactura);
    });

    it('debería retornar error si la factura no existe', async () => {
      db.Factura.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/facturas/999')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe('No se encontró la factura especificada.');
    });

    it('debería manejar errores al obtener una factura', async () => {
      db.Factura.findByPk.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/facturas/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Ocurrió un error al consultar la factura. Por favor, intente nuevamente.');
    });
  });

  describe('PUT /facturas/:facturaId/anular', () => {
    it('debería anular una factura existente', async () => {
      const mockFactura = { id: 1, estado: 'Activa' };
      db.Factura.findByPk.mockResolvedValue(mockFactura);
      db.Factura.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/facturas/1/anular')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('La factura ha sido anulada correctamente');
    });

    it('debería retornar error si la factura no existe', async () => {
      db.Factura.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/facturas/999/anular')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No se encontró la factura especificada.');
    });

    it('debería manejar errores al anular una factura', async () => {
      const mockFactura = { id: 1, estado: 'Activa' };
      db.Factura.findByPk.mockResolvedValue(mockFactura);
      db.Factura.update.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .put('/api/facturas/1/anular')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudo anular la factura. Por favor, intente nuevamente.');
    });
  });
});