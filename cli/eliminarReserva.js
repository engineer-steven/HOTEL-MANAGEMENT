const inquirer = require('inquirer');
const { Reserva, Habitacion } = require('../models');

async function eliminarReserva() {
  const { idReserva } = await inquirer.prompt([
    { type: 'input', name: 'idReserva', message: 'ID de la reserva a eliminar:' }
  ]);

  const reserva = await Reserva.findByPk(idReserva);
  if (!reserva) {
    console.log('❌ Reserva no encontrada');
    return;
  }

  await Habitacion.update({ disponible: true }, { where: { id: reserva.HabitacionId } });
  await reserva.destroy();

  console.log('✅ Reserva eliminada correctamente');
}

module.exports = { eliminarReserva };
