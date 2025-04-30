const { crearReserva } = require('./crearReserva');
const { eliminarReserva } = require('./eliminarReserva');
const { actualizarReserva } = require('./actualizarReserva');
const { buscarHuesped } = require('./buscarHuesped');
const { verificarDisponibilidad } = require('./verificarDisponibilidad');

async function ejecutarAccion(opcion, usuario) {
  switch (opcion) {
    case 'Crear reserva':
      await crearReserva();
      break;
    case 'Eliminar reserva':
      await eliminarReserva();
      break;
    case 'Actualizar reserva':
      await actualizarReserva(usuario);
      break;
    case 'Buscar huésped':
      await buscarHuesped();
      break;
    case 'Verificar disponibilidad':
      await verificarDisponibilidad();
      break;
    default:
      console.log('Opción no reconocida.');
  }
}

module.exports = { ejecutarAccion };
