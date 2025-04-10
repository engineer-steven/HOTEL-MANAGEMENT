module.exports = (sequelize, DataTypes) => {
    const Empleado = sequelize.define('Empleado', {
      nombre: DataTypes.STRING,
      correo: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      rol: DataTypes.STRING
    });
  
    return Empleado;
  };
  