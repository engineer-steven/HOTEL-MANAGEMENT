const sqlite3 = require('sqlite3').verbose();

// Crear una conexión a la base de datos
const db = new sqlite3.Database('./database.sqlite');

// Función para obtener un registro de la base de datos
const get = (query, params, callback) => {
    db.get(query, params, callback);
};

module.exports = {
    get
}; 