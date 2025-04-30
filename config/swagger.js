const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        version: '1.0.0',
        title: 'API Hotel Management',
        description: 'Documentación completa de la API del sistema de gestión hotelera'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        { name: 'Autenticación', description: 'Endpoints de autenticación y autorización' },
        { name: 'Reservas', description: 'Endpoints de gestión de reservas' },
        { name: 'Facturas', description: 'Endpoints de gestión de facturas' },
        { name: 'Huéspedes', description: 'Endpoints de gestión de huéspedes' },
        { name: 'Recepcionista', description: 'Endpoints específicos para recepcionistas' },
        { name: 'Supervisor', description: 'Endpoints específicos para supervisores' },
        { name: 'Notificaciones', description: 'Endpoints de gestión de notificaciones' }
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Token JWT de autenticación'
        }
    },
    definitions: {
        Reserva: {
            fechaInicio: { type: 'string', format: 'date' },
            fechaFin: { type: 'string', format: 'date' },
            habitacionId: { type: 'integer' },
            huespedId: { type: 'integer' },
            estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'completada'] }
        },
        Factura: {
            monto: { type: 'number' },
            estado: { type: 'string', enum: ['pendiente', 'pagada', 'anulada'] },
            reservaId: { type: 'integer' },
            fechaEmision: { type: 'string', format: 'date-time' }
        },
        Huesped: {
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            documento: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' }
        },
        Notificacion: {
            mensaje: { type: 'string' },
            tipo: { type: 'string', enum: ['info', 'warning', 'error'] },
            leida: { type: 'boolean' },
            fecha: { type: 'string', format: 'date-time' }
        },
        Usuario: {
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['recepcionista', 'supervisor'] }
        }
    }
};

const outputFile = './swagger.json';
const routes = [
    './routes/auth.routes.js',
    './routes/reservas.routes.js',
    './routes/factura.routes.js',
    './routes/huesped.routes.js',
    './routes/recepcionista.routes.js',
    './routes/supervisor.routes.js',
    './routes/notificacion.routes.js'
];

swaggerAutogen(outputFile, routes, doc); 