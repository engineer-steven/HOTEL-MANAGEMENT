module.exports = (sequelize, DataTypes) => {
    const Huesped = sequelize.define('Huesped', {
      nombre: DataTypes.STRING,
      documento: { type: DataTypes.STRING, unique: true },
      correo: DataTypes.STRING
    });
  
    Huesped.associate = models => {
      Huesped.hasMany(models.Reserva);
    };
  
    return Huesped;
  };
  