const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

class Usuario extends Model {
  static init(sequelize) {
    return super.init({
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rol: {
        type: DataTypes.ENUM('recepcionista', 'supervisor'),
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Usuario',
      hooks: {
        beforeCreate: async (usuario) => {
          if (usuario.password) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
          }
        }
      }
    });
  }

  async validarPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  static associate(models) {
    // Aquí puedes definir las asociaciones si son necesarias
  }
}

module.exports = Usuario; 