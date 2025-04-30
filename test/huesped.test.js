const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('🏨 Pruebas del controlador de huéspedes', () => {
  beforeAll(async () => {
    // Sincronizar la base de datos antes de todas las pruebas
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpiar la tabla de huéspedes antes de cada prueba
    await db.Huesped.destroy({ where: {} });
  });

  afterAll(async () => {
    // Cerrar la conexión a la base de datos después de todas las pruebas
    await db.sequelize.close();
  });

  describe('✅ Registrar un huésped', () => {
    it('debería registrar un nuevo huésped exitosamente', async () => {
      const huespedData = {
        nombre: 'Juan Pérez',
        documento: '12345678',
        correo: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/huespedes')
        .set('Authorization', 'Bearer mock-token')
        .send(huespedData);

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Huésped registrado exitosamente');
      expect(response.body.huesped.nombre).toBe(huespedData.nombre);
      expect(response.body.huesped.documento).toBe(huespedData.documento);
      expect(response.body.huesped.correo).toBe(huespedData.correo);
    });

    it('debería devolver un error 400 si faltan campos requeridos', async () => {
      const huespedData = {
        correo: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/huespedes')
        .set('Authorization', 'Bearer mock-token')
        .send(huespedData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nombre y documento son campos requeridos.');
    });

    it('debería devolver un error 400 si el documento ya existe', async () => {
      // Crear un huésped primero
      await db.Huesped.create({
        nombre: 'Juan Pérez',
        documento: '12345678',
        correo: 'juan@example.com'
      });

      // Intentar crear otro con el mismo documento
      const huespedData = {
        nombre: 'Otro Nombre',
        documento: '12345678',
        correo: 'otro@example.com'
      };

      const response = await request(app)
        .post('/api/huespedes')
        .set('Authorization', 'Bearer mock-token')
        .send(huespedData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ya existe un huésped con este documento.');
    });
  });

  describe('📋 Obtener huéspedes', () => {
    it('debería obtener todos los huéspedes', async () => {
      // Crear algunos huéspedes de prueba
      await db.Huesped.bulkCreate([
        {
          nombre: 'Juan Pérez',
          documento: '12345678',
          correo: 'juan@example.com'
        },
        {
          nombre: 'María García',
          documento: '87654321',
          correo: 'maria@example.com'
        }
      ]);

      const response = await request(app)
        .get('/api/huespedes')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.huespedes.length).toBe(2);
      expect(response.body.huespedes[0].nombre).toBe('Juan Pérez');
      expect(response.body.huespedes[1].nombre).toBe('María García');
    });
  });
}); 