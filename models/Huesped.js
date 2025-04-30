const { Model } = require('sequelize');

class Huesped extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      nombre: DataTypes.STRING,
      documento: { type: DataTypes.STRING, unique: true },
      correo: DataTypes.STRING
    }, {
      sequelize,
      modelName: 'Huesped'
    });
  }

  static associate(models) {
    Huesped.hasMany(models.Reserva);
  }
}

module.exports = Huesped;
  