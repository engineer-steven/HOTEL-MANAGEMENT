const inquirer = require('inquirer');
const bcrypt = require('bcrypt');
const { Empleado } = require('../models');

async function login() {
  const { correo, password } = await inquirer.prompt([
    { type: 'input', name: 'correo', message: 'Correo:' },
    { type: 'password', name: 'password', message: 'Contraseña:' }
  ]);

  const empleado = await Empleado.findOne({ where: { correo } });

  if (!empleado || !(await bcrypt.compare(password, empleado.password))) {
    console.log('❌ Credenciales incorrectas');
    return null;
  }

  console.log(`✅ Bienvenido, ${empleado.nombre} (${empleado.rol})`);
  return empleado;
}

module.exports = { login };
