const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const { Notificacion, Reserva, Usuario } = require('../models');

describe('Sistema de Notificaciones', () => {
  let token;
  let supervisorToken;
  let notificacionId;

  beforeAll(async () => {
    // Sincronizar la base de datos
    await db.sync({ force: true });

    // Crear usuarios de prueba
    const recepcionista = await Usuario.create({
      email: 'recepcionista@hotel.com',
      password: 'password123',
      rol: 'recepcionista'
    });

    const supervisor = await Usuario.create({
      email: 'supervisor@hotel.com',
      password: 'password123',
      rol: 'supervisor'
    });

    // Obtener tokens
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recepcionista@hotel.com',
        password: 'password123'
      });
    token = loginResponse.body.token;

    const supervisorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'supervisor@hotel.com',
        password: 'password123'
      });
    supervisorToken = supervisorLogin.body.token;
  });

  afterAll(async () => {
    await db.close();
  });

  test('Debe crear una notificación de actualización de reserva', async () => {
    const response = await request(app)
      .post('/api/notificaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mensaje: 'Solicitud de cambio de fecha de reserva',
        tipo: 'actualizacion_reserva',
        datos: {
          fechaEntrada: '2024-04-01',
          fechaSalida: '2024-04-05'
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.notificacion).toBeDefined();
    expect(response.body.notificacion.estado).toBe('pendiente');
    notificacionId = response.body.notificacion.id;
  });

  test('Supervisor debe poder ver notificaciones pendientes', async () => {
    const response = await request(app)
      .get('/api/notificaciones/pendientes')
      .set('Authorization', `Bearer ${supervisorToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].estado).toBe('pendiente');
  });

  test('Supervisor debe poder aprobar una notificación', async () => {
    const response = await request(app)
      .put(`/api/notificaciones/${notificacionId}/estado`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        estado: 'aprobada'
      });

    expect(response.status).toBe(200);
    expect(response.body.notificacion.estado).toBe('aprobada');
  });
}); 