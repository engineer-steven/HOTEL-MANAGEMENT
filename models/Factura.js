module.exports = (sequelize, DataTypes) => {
    const Factura = sequelize.define('Factura', {
      descripcion: DataTypes.STRING,
      monto: DataTypes.FLOAT,
      metodoPago: DataTypes.STRING,
      // ... otros campos de tu modelo Factura
    });
  
    Factura.associate = function(models) {
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