// models/Pago.js
const { Model, DataTypes } = require('sequelize');

class Pago extends Model {
  static init(sequelize) {
    return super.init({
      monto: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      metodo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado: {
        type: DataTypes.STRING,
        defaultValue: 'Completado'
      }
    }, {
      sequelize,
      modelName: 'Pago'
    });
  }

  static associate(models) {
    Pago.belongsTo(models.Factura, {
      foreignKey: 'FacturaId',
      as: 'factura'
    });
  }
}

module.exports = Pago;
  