require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { run, initDB, addLog } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Servir frontend de forma estática desde la carpeta raíz
app.use(express.static(path.join(__dirname, '..')));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const spotRoutes = require('./routes/spotRoutes');
const resRoutes = require('./routes/resRoutes');
const transRoutes = require('./routes/transRoutes');
const statsRoutes = require('./routes/statsRoutes');
const logRoutes = require('./routes/logRoutes');

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes); // compatible con lo solicitado
app.use('/api/users', userRoutes);    // compatible con frontend original
app.use('/api/espacios', spotRoutes);  // compatible con lo solicitado
app.use('/api/spots', spotRoutes);      // compatible con frontend original
app.use('/api/reservas', resRoutes);   // compatible con lo solicitado
app.use('/api/reservations', resRoutes);// compatible con frontend original
app.use('/api/transacciones', transRoutes); // compatible con lo solicitado
app.use('/api/transactions', transRoutes); // compatible con frontend original
app.use('/api/estadisticas', statsRoutes); // compatible con lo solicitado
app.use('/api/stats', statsRoutes);      // compatible con frontend original
app.use('/api/logs', logRoutes);

// Endpoint adicional para reiniciar la base de datos desde la consola del frontend
app.post('/api/db/reset', async (req, res, next) => {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './models/parking.db');
    const { db } = require('./config/database');

    // Cerrar la base de datos actual para poder eliminar el archivo
    db.close(async (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al cerrar la base de datos' });
      }

      const fs = require('fs');
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }

      // Re-requerir o forzar reinicialización
      // Para hacerlo simple y limpio:
      process.exit(0); // Al salir con 0, nodemon reiniciará el servidor automáticamente y recreará la base de datos limpia.
    });
  } catch (error) {
    next(error);
  }
});

// Middleware de manejo de errores
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor de Parking Lot ejecutándose en http://localhost:${PORT}`);
});
