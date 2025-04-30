const { Model, DataTypes } = require('sequelize');

class Habitacion extends Model {
  static init(sequelize) {
    return super.init({
      numero: { type: DataTypes.INTEGER, unique: true },
      tipo: DataTypes.STRING,
      estado: { type: DataTypes.STRING, defaultValue: 'Disponible' }
    }, {
      sequelize,
      modelName: 'Habitacion'
    });
  }

  static associate(models) {
    Habitacion.hasMany(models.Reserva);
  }
}

module.exports = Habitacion;
  