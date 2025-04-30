const db = require('../models');
const supervisorController = require('../controllers/supervisor.controller');

describe('Supervisor Controller', () => {
  beforeAll(async () => {
    // Sincronizar la base de datos antes de las pruebas
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpiar las tablas antes de cada prueba
    await db.sequelize.query('DELETE FROM Empleados');
    await db.sequelize.query('DELETE FROM Facturas');
    await db.sequelize.query('DELETE FROM Pagos');
  });

  afterAll(async () => {
    // Cerrar la conexión a la base de datos
    await db.sequelize.close();
  });

  describe('registrarRecepcionista', () => {
    it('debería registrar un nuevo recepcionista', async () => {
      const req = {
        body: {
          nombre: 'Juan Perez',
          correo: 'juan@test.com',
          password: '123456'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.registrarRecepcionista(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const empleado = await db.Empleado.findOne({ where: { correo: 'juan@test.com' } });
      expect(empleado).toBeTruthy();
      expect(empleado.rol).toBe('Recepcionista');
    });

    it('debería manejar datos faltantes', async () => {
      const req = {
        body: {
          nombre: 'Juan Perez'
          // Falta correo y password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.registrarRecepcionista(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos' });
    });

    it('debería manejar correo duplicado', async () => {
      // Crear un empleado existente
      await db.Empleado.create({
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        password: '123456',
        rol: 'Recepcionista'
      });

      const req = {
        body: {
          nombre: 'Juan Perez',
          correo: 'juan@test.com',
          password: '123456'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.registrarRecepcionista(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El correo ya está registrado' });
    });
  });

  describe('procesarReembolso', () => {
    it('debería procesar un reembolso correctamente', async () => {
      const factura = await db.Factura.create({ monto: 100 });
      const pago = await db.Pago.create({ 
        monto: 100, 
        metodo: 'Tarjeta', 
        FacturaId: factura.id,
        estado: 'Completado'
      });

      const req = {
        params: { facturaId: factura.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.procesarReembolso(req, res);

      expect(res.json).toHaveBeenCalled();
      const updatedPago = await db.Pago.findByPk(pago.id);
      expect(updatedPago.estado).toBe('Reembolsado');
      const updatedFactura = await db.Factura.findByPk(factura.id);
      expect(updatedFactura.anulada).toBe(true);
    });

    it('debería manejar pago no encontrado', async () => {
      const req = {
        params: { facturaId: 999 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.procesarReembolso(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pago no encontrado' });
    });

    it('debería manejar pago ya reembolsado', async () => {
      const factura = await db.Factura.create({ monto: 100 });
      const pago = await db.Pago.create({ 
        monto: 100, 
        metodo: 'Tarjeta', 
        FacturaId: factura.id,
        estado: 'Reembolsado'
      });

      const req = {
        params: { facturaId: factura.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.procesarReembolso(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El pago ya ha sido reembolsado' });
    });
  });

  describe('anularFactura', () => {
    it('debería anular una factura correctamente', async () => {
      const factura = await db.Factura.create({ monto: 100, anulada: false });

      const req = {
        params: { facturaId: factura.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.anularFactura(req, res);

      expect(res.json).toHaveBeenCalled();
      const updatedFactura = await db.Factura.findByPk(factura.id);
      expect(updatedFactura.anulada).toBe(true);
    });

    it('debería manejar factura no encontrada', async () => {
      const req = {
        params: { facturaId: 999 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.anularFactura(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Factura no encontrada' });
    });

    it('debería manejar factura ya anulada', async () => {
      const factura = await db.Factura.create({ monto: 100, anulada: true });

      const req = {
        params: { facturaId: factura.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.anularFactura(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'La factura ya está anulada' });
    });
  });

  describe('detectarDiscrepancias', () => {
    it('debería detectar discrepancias correctamente', async () => {
      const factura1 = await db.Factura.create({ monto: 100 });
      await db.Pago.create({ monto: 50, metodo: 'Efectivo', FacturaId: factura1.id });
      await db.Pago.create({ monto: 40, metodo: 'Tarjeta', FacturaId: factura1.id });

      const factura2 = await db.Factura.create({ monto: 200 });
      await db.Pago.create({ monto: 200, metodo: 'Efectivo', FacturaId: factura2.id });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await supervisorController.detectarDiscrepancias(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toBeDefined();
      expect(response.length).toBe(1);
      expect(response[0].id).toBe(factura1.id);
    });

    it('debería manejar errores correctamente', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Forzar un error en la consulta
      jest.spyOn(db.Factura, 'findAll').mockRejectedValue(new Error('Error de base de datos'));

      await supervisorController.detectarDiscrepancias(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al detectar discrepancias' });
    });
  });
});
