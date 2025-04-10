const inquirer = require('inquirer');
const { Huesped, Reserva } = require('../models');

async function buscarHuesped() {
  const { documento } = await inquirer.prompt([
    { type: 'input', name: 'documento', message: 'Documento del huésped:' }
  ]);

  const huesped = await Huesped.findOne({ where: { documento }, include: Reserva });

  if (!huesped) {
    console.log('❌ Huésped no encontrado');
    return;
  }

  console.log(`👤 Nombre: ${huesped.nombre}`);
  console.log(`📄 Documento: ${huesped.documento}`);
  console.log(`📧 Correo: ${huesped.correo}`);
  console.log('📅 Reservas:');
  huesped.Reservas.forEach(r => {
    console.log(`- Entrada: ${r.fechaEntrada}, Salida: ${r.fechaSalida}`);
  });
}

module.exports = { buscarHuesped };
