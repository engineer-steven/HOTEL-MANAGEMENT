const { Model, DataTypes } = require('sequelize');

class Notificacion extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'actualizacion_reserva'
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      mensaje: {
        type: DataTypes.STRING,
        allowNull: false
      },
      datos: {
        type: DataTypes.JSON,
        allowNull: false
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'Notificacion'
    });
  }

  static associate(models) {
    // Define las asociaciones aquí si las hay
  }
}

module.exports = Notificacion; 