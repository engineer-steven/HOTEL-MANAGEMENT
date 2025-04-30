const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Conexión establecida correctamente.");

    await db.sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas sin eliminar nada.");

    process.exit();
  } catch (err) {
    console.error("❌ Error al conectar o sincronizar:", err.message);
    process.exit(1);
  }
})();
