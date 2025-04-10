const { Habitacion } = require('../models');

async function verificarDisponibilidad() {
  const disponibles = await Habitacion.findAll({ where: { disponible: true } });

  if (disponibles.length === 0) {
    console.log('❌ No hay habitaciones disponibles');
    return;
  }

  console.log('✅ Habitaciones disponibles:');
  disponibles.forEach(h => {
    console.log(`- Habitación ${h.numero} (${h.tipo})`);
  });
}

module.exports = { verificarDisponibilidad };
