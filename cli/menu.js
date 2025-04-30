const inquirer = require('inquirer');
const { ejecutarAccion } = require('./actions');
const { registrarRecepcionista } = require('./registroRecepcionista');

async function mostrarMenuPorRol(usuario) {
  let salir = false;

  while (!salir) {
    let opciones = [];

    if (usuario.rol === 'Supervisor') {
      opciones = ['Registrar recepcionista', 'Salir'];
    } else if (usuario.rol === 'Recepcionista') {
      opciones = [
        'Crear reserva',
        'Eliminar reserva',
        'Actualizar reserva',
        'Buscar huésped',
        'Verificar disponibilidad',
        'Salir'
      ];
    }

    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: 'Selecciona una acción:',
        choices: opciones
      }
    ]);

    if (opcion === 'Salir') {
      salir = true;
    } else if (opcion === 'Registrar recepcionista') {
      await registrarRecepcionista();
    } else {
      await ejecutarAccion(opcion, usuario);
    }
  }
}

module.exports = { mostrarMenuPorRol };
