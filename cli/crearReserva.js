const inquirer = require('inquirer');
const { Habitacion, Huesped, Reserva } = require('../models');
const { enviarCorreoReserva } = require('../utils/correo');

async function crearReserva() {
  const datos = await inquirer.prompt([
    { type: 'input', name: 'nombre', message: 'Nombre del huésped:' },
    { type: 'input', name: 'documento', message: 'Documento de identidad:' },
    { type: 'input', name: 'correo', message: 'Correo electrónico (opcional):' },
    { type: 'input', name: 'fechaEntrada', message: 'Fecha de entrada (YYYY-MM-DD):' },
    { type: 'input', name: 'fechaSalida', message: 'Fecha de salida (YYYY-MM-DD):' }
  ]);

  const disponibles = await Habitacion.findAll({ where: { disponible: true } });

  if (disponibles.length === 0) {
    console.log('❌ No hay habitaciones disponibles');
    return;
  }

  const { idHabitacion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'idHabitacion',
      message: 'Selecciona una habitación disponible:',
      choices: disponibles.map(h => ({
        name: `Habitación ${h.numero} (${h.tipo})`,
        value: h.id
      }))
    }
  ]);

  const [huesped] = await Huesped.findOrCreate({
    where: { documento: datos.documento },
    defaults: { nombre: datos.nombre, correo: datos.correo }
  });

  const reserva = await Reserva.create({
    fechaEntrada: datos.fechaEntrada,
    fechaSalida: datos.fechaSalida,
    HabitacionId: idHabitacion,
    HuespedId: huesped.id
  });

  await Habitacion.update({ disponible: false }, { where: { id: idHabitacion } });

  console.log('✅ Reserva creada exitosamente');

  if (datos.correo) {
    await enviarCorreoReserva(datos.correo, {
      nombre: datos.nombre,
      fechaEntrada: datos.fechaEntrada,
      fechaSalida: datos.fechaSalida
    });
  }
}

module.exports = { crearReserva };
