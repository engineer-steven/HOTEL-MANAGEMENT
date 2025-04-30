const inquirer = require('inquirer');
const { Reserva, Habitacion } = require('../models');

async function actualizarReserva(usuario) {
  if (usuario.rol !== 'Supervisor') {
    console.log('⛔ Solo el supervisor puede autorizar la actualización de reservas.');
    return;
  }

  const { idReserva, nuevaFechaEntrada, nuevaFechaSalida } = await inquirer.prompt([
    { type: 'input', name: 'idReserva', message: 'ID de la reserva a actualizar:' },
    { type: 'input', name: 'nuevaFechaEntrada', message: 'Nueva fecha de entrada (YYYY-MM-DD):' },
    { type: 'input', name: 'nuevaFechaSalida', message: 'Nueva fecha de salida (YYYY-MM-DD):' }
  ]);

  const reserva = await Reserva.findByPk(idReserva);
  if (!reserva) {
    console.log('❌ Reserva no encontrada');
    return;
  }

  reserva.fechaEntrada = nuevaFechaEntrada;
  reserva.fechaSalida = nuevaFechaSalida;
  await reserva.save();

  console.log('✅ Reserva actualizada correctamente');
}

module.exports = { actualizarReserva };
