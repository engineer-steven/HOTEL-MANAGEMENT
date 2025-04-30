const { Sequelize } = require('sequelize');

// Configuración para pruebas con SQLite en memoria
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false, // Desactivar logging para pruebas
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: false,
    paranoid: false
  }
});

// Sincronizar la base de datos
sequelize.sync({ force: true })
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

module.exports = sequelize; 