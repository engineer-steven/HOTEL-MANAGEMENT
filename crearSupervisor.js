// crearSupervisor.js
const bcrypt = require('bcrypt');
const { Empleado, sequelize } = require('./models');

async function crearSupervisor() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const existe = await Empleado.findOne({ where: { correo: 'steven@hotel.com' } });
    if (existe) {
      console.log('⚠️ El supervisor ya existe.');
      return;
    }

    const hash = await bcrypt.hash('admin123', 10);

    await Empleado.create({
      nombre: 'Steven Supervisor',
      correo: 'steven@hotel.com',
      password: hash,
      rol: 'Supervisor'
    });

    console.log('✅ Supervisor creado correctamente');
    console.log('➡️ Correo: steven@hotel.com');
    console.log('➡️ Contraseña: admin123');
  } catch (err) {
    console.error('❌ Error al crear supervisor:', err.message);
  } finally {
    await sequelize.close();
  }
}

crearSupervisor();
