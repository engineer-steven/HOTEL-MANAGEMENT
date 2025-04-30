const inquirer = require('inquirer');
const bcrypt = require('bcrypt');
const { Empleado } = require('../models');

async function registrarRecepcionista() {
  const respuestas = await inquirer.prompt([
    { type: 'input', name: 'nombre', message: 'Nombre del recepcionista:' },
    { type: 'input', name: 'correo', message: 'Correo electrónico:' },
    { type: 'password', name: 'password', message: 'Contraseña:' }
  ]);

  const hash = await bcrypt.hash(respuestas.password, 10);

  await Empleado.create({
    nombre: respuestas.nombre,
    correo: respuestas.correo,
    password: hash,
    rol: 'Recepcionista'
  });

  console.log('✅ Recepcionista registrado correctamente');
}

module.exports = { registrarRecepcionista };
