const { Model } = require('sequelize');

class Empleado extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      nombre: DataTypes.STRING,
      correo: { 
        type: DataTypes.STRING, 
        unique: true 
      },
      password: DataTypes.STRING,
      rol: DataTypes.STRING
    }, {
      sequelize,
      modelName: 'Empleado'
    });
  }

  static associate(models) {
    // Define las asociaciones aquí si las hay
  }
}

module.exports = Empleado;
  