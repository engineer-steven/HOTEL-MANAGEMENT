module.exports = (sequelize, DataTypes) => {
    const Habitacion = sequelize.define('Habitacion', {
      numero: { type: DataTypes.STRING, unique: true },
      tipo: DataTypes.STRING,
      disponible: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
  
    Habitacion.associate = models => {
      Habitacion.hasMany(models.Reserva);
    };
  
    return Habitacion;
  };
  