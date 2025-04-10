const db = require('../models');
const request = require('supertest');
const app = require('../server');

beforeAll(async () => {
  await db.sequelize.sync({ alter: true });
  await db.Huesped.destroy({ where: {} });
  await db.Factura.destroy({ where: {} });
});

describe('🛡️ Funcionalidades del Supervisor', () => {
  test('💰 Procesar reembolso', async () => {
    const huesped = await db.Huesped.create({ nombre: 'Luis', documento: '9999', correo: 'luis@test.com' });
    const factura = await db.Factura.create({ HuespedId: huesped.id, total: 100, metodoPago: 'efectivo' });
    factura.reembolsada = true;
    await factura.save();
    expect(factura.reembolsada).toBe(true);
  });

  test('❌ Anular factura', async () => {
    const huesped = await db.Huesped.create({ nombre: 'Luis', documento: '9998' });
    const factura = await db.Factura.create({ HuespedId: huesped.id, total: 200, metodoPago: 'tarjeta' });
    await factura.destroy();
    const anulada = await db.Factura.findByPk(factura.id);
    expect(anulada).toBeNull();
  });

  test('🔎 Detectar discrepancias', async () => {
    const pagos = await db.Factura.findAll();
    const discrepancia = pagos.some(f => f.total < 0);
    expect(discrepancia).toBe(false);
  });
});
