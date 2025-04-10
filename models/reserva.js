module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    fechaEntrada: DataTypes.DATE,
    fechaSalida: DataTypes.DATE,
    estado: DataTypes.STRING,
    // ... otros campos de tu modelo Reserva
  });

  Reserva.associate = function(models) {
    Reserva.belongsTo(models.Habitacion, {
      foreignKey: 'HabitacionId',
      as: 'habitacion'
    });
    Reserva.belongsTo(models.Huesped, {
      foreignKey: 'HuespedId',
      as: 'huesped'
    });
    Reserva.hasOne(models.Factura, {
      foreignKey: 'ReservaId',
      as: 'factura'
    });
  };

  return Reserva;
};