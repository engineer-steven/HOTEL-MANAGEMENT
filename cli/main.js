const { login } = require('./auth');
const { mostrarMenuPorRol } = require('./menu');

async function iniciarCLI() {
  const usuario = await login();
  if (!usuario) {
    console.log('❌ Error al iniciar sesión.');
    return;
  }

  await mostrarMenuPorRol(usuario);
}

iniciarCLI();
