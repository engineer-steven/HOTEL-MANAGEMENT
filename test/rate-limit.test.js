const request = require('supertest');
const app = require('../server');

// Mock del middleware de autenticación si existe
jest.mock('../middleware/auth', () => ({
  verificarToken: (req, res, next) => next(),
  soloRecepcionista: (req, res, next) => next(),
  soloSupervisor: (req, res, next) => next()
}));

describe('Rate Limiting Tests', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('debería permitir peticiones dentro del límite', async () => {
    // Realizar 5 peticiones (bien dentro del límite de 100)
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    }
  });

  it('debería incluir headers de rate limit', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json');
    
    // Verificar que los headers de rate limit estén presentes
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers).toHaveProperty('ratelimit-remaining');
    expect(response.headers).toHaveProperty('ratelimit-reset');

    // Verificar que los valores sean números
    expect(Number(response.headers['ratelimit-limit'])).not.toBeNaN();
    expect(Number(response.headers['ratelimit-remaining'])).not.toBeNaN();
    expect(Number(response.headers['ratelimit-reset'])).not.toBeNaN();
  });

  it('debería devolver error 429 cuando se excede el límite', async () => {
    // Realizar más peticiones de las permitidas
    const promises = Array(101).fill().map(() => 
      request(app)
        .get('/')
        .set('Accept', 'application/json')
    );

    const responses = await Promise.all(promises);
    const lastResponse = responses[responses.length - 1];

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body).toHaveProperty('error');
    expect(lastResponse.body.error).toContain('Demasiadas peticiones');
  });
}); 