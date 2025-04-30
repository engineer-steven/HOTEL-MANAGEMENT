const db = require('./models');

db.sequelize.sync({ force: false }) // o { alter: true } si quieres ajustar columnas
  .then(() => {
    console.log('✅ Base de datos sincronizada');
  })
  .catch(error => {
    console.error('❌ Error al sincronizar:', error);
  });
