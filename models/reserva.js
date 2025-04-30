const { Model, DataTypes } = require('sequelize');

class Reserva extends Model {
  static init(sequelize) {
    return super.init({
      fechaEntrada: DataTypes.DATE,
      fechaSalida: DataTypes.DATE,
      estado: { type: DataTypes.STRING, defaultValue: 'Pendiente' }
    }, {
      sequelize,
      modelName: 'Reserva'
    });
  }

  static associate(models) {
    Reserva.belongsTo(models.Habitacion);
    Reserva.belongsTo(models.Huesped);
    Reserva.hasOne(models.Factura);
  }
}

module.exports = Reserva;