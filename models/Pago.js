// models/Pago.js
module.exports = (sequelize, DataTypes) => {
    const Pago = sequelize.define('Pago', {
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
      }
    });
  
    Pago.associate = (models) => {
      Pago.belongsTo(models.Factura); // Relación con Factura
    };
  
    return Pago;
  };
  