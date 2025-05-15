const { Sequelize } = require('sequelize');
const testConfig = require('./test.config');

const isTest = process.env.NODE_ENV === 'test';
const config = isTest ? testConfig.database : {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management',
  logging: false
};

const sequelize = new Sequelize(config);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Base de datos sincronizada');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
};

if (!isTest) {
  testConnection();
}

module.exports = sequelize; 