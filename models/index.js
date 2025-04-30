// models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Leer todos los archivos de modelo
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

// Cargar todos los modelos
for (const file of modelFiles) {
  const model = require(path.join(__dirname, file));
  if (model.prototype instanceof Model) {
    // Para modelos en estilo de clase ES6
    model.init(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  } else if (typeof model === 'function') {
    // Para modelos en estilo de función
    const modelInstance = model(sequelize, Sequelize.DataTypes);
    db[modelInstance.name] = modelInstance;
  }
}

// Establecer las asociaciones después de que todos los modelos estén inicializados
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
