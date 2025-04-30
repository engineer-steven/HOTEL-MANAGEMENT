module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    descripcion: DataTypes.STRING,
    monto: DataTypes.FLOAT,
    metodoPago: DataTypes.STRING,
    anulada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Factura.associate = models => {
    Factura.belongsTo(models.Reserva, {
      foreignKey: 'ReservaId',
      as: 'reserva'
    });
    Factura.hasMany(models.Pago, {
      foreignKey: 'FacturaId',
      as: 'pagos'
    });
  };

  return Factura;
};