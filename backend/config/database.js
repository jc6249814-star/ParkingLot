const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './models/parking.db');

// Asegurar que la carpeta models exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite en:', dbPath);
    initDB();
  }
});

// Helper para consultas asíncronas
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function initDB() {
  // Crear tabla de usuarios
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      user TEXT UNIQUE NOT NULL,
      pass TEXT NOT NULL,
      rol TEXT NOT NULL
    )
  `);

  // Crear tabla de espacios
  await run(`
    CREATE TABLE IF NOT EXISTS spots (
      id TEXT PRIMARY KEY,
      zona TEXT NOT NULL,
      numero INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Disponible',
      placa TEXT,
      entrada TEXT,
      cliente TEXT,
      fechaReserva TEXT
    )
  `);

  // Crear tabla de reservas
  await run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      placa TEXT NOT NULL,
      espacio TEXT NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Activa'
    )
  `);

  // Crear tabla de transacciones
  await run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT NOT NULL,
      espacio TEXT NOT NULL,
      entrada TEXT NOT NULL,
      salida TEXT NOT NULL,
      valor INTEGER NOT NULL
    )
  `);

  // Crear tabla de logs de actividad
  await run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL
    )
  `);

  // Poblar usuarios iniciales si no existen
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const adminPass = await bcrypt.hash('admin123', 10);
    const opPass = await bcrypt.hash('operador123', 10);
    const clientPass = await bcrypt.hash('carlos123', 10);

    await run('INSERT INTO users (nombre, email, user, pass, rol) VALUES (?, ?, ?, ?, ?)', 
      ['Jenniffer Castañeda', 'jenniffer@sena.edu.co', 'admin', adminPass, 'Administrador']);
    await run('INSERT INTO users (nombre, email, user, pass, rol) VALUES (?, ?, ?, ?, ?)', 
      ['Pedro Pérez', 'pedro@parking.com', 'operador', opPass, 'Operador']);
    await run('INSERT INTO users (nombre, email, user, pass, rol) VALUES (?, ?, ?, ?, ?)', 
      ['Carlos Restrepo', 'carlos@gmail.com', 'carlos', clientPass, 'Cliente']);
    
    console.log('Usuarios de prueba creados.');
  }

  // Poblar spots si no existen
  const spotCount = await get('SELECT COUNT(*) as count FROM spots');
  if (spotCount.count === 0) {
    const zones = ["A", "B", "C"];
    for (const zone of zones) {
      for (let i = 1; i <= 10; i++) {
        let estado = "Disponible";
        let placa = null;
        let entrada = null;
        let cliente = null;
        let fechaReserva = null;

        if (zone === "A" && i === 2) {
          estado = "Ocupado";
          placa = "ABC-123";
          entrada = new Date(Date.now() - 3600000 * 3).toISOString();
        } else if (zone === "A" && i === 5) {
          estado = "Reservado";
          placa = "XYZ-987";
          cliente = "carlos";
          fechaReserva = new Date(Date.now() + 3600000 * 2).toISOString();
        } else if (zone === "B" && i === 3) {
          estado = "Ocupado";
          placa = "KSM-456";
          entrada = new Date(Date.now() - 3600000 * 1.5).toISOString();
        }

        await run('INSERT INTO spots (id, zona, numero, estado, placa, entrada, cliente, fechaReserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [`${zone}${i}`, zone, i, estado, placa, entrada, cliente, fechaReserva]);
      }
    }
    console.log('Espacios de parqueo inicializados.');
  }

  // Reservas iniciales
  const resCount = await get('SELECT COUNT(*) as count FROM reservations');
  if (resCount.count === 0) {
    await run('INSERT INTO reservations (cliente, placa, espacio, fecha, estado) VALUES (?, ?, ?, ?, ?)',
      ['carlos', 'XYZ-987', 'A5', new Date(Date.now() + 3600000 * 2).toISOString(), 'Activa']);
  }

  // Transacciones iniciales
  const transCount = await get('SELECT COUNT(*) as count FROM transactions');
  if (transCount.count === 0) {
    await run('INSERT INTO transactions (placa, espacio, entrada, salida, valor) VALUES (?, ?, ?, ?, ?)',
      ['MNO-456', 'B2', new Date(Date.now() - 3600000 * 8).toISOString(), new Date(Date.now() - 3600000 * 6).toISOString(), 10000]);
    await run('INSERT INTO transactions (placa, espacio, entrada, salida, valor) VALUES (?, ?, ?, ?, ?)',
      ['QWE-789', 'C1', new Date(Date.now() - 3600000 * 5).toISOString(), new Date(Date.now() - 3600000 * 4).toISOString(), 5000]);
    await run('INSERT INTO transactions (placa, espacio, entrada, salida, valor) VALUES (?, ?, ?, ?, ?)',
      ['RTY-112', 'A9', new Date(Date.now() - 3600000 * 2).toISOString(), new Date(Date.now() - 3600000 * 1).toISOString(), 5000]);
  }

  // Logs iniciales
  const logsCount = await get('SELECT COUNT(*) as count FROM logs');
  if (logsCount.count === 0) {
    await run('INSERT INTO logs (timestamp, action) VALUES (?, ?)',
      [new Date().toISOString(), 'Sistema de parqueo inicializado en SQLite.']);
  }
}

// Log helper
async function addLog(action) {
  await run('INSERT INTO logs (timestamp, action) VALUES (?, ?)', [new Date().toISOString(), action]);
  // Limitar logs a los últimos 50
  const count = await get('SELECT COUNT(*) as count FROM logs');
  if (count.count > 50) {
    const oldest = await get('SELECT id FROM logs ORDER BY timestamp ASC LIMIT 1');
    if (oldest) {
      await run('DELETE FROM logs WHERE id = ?', [oldest.id]);
    }
  }
}

module.exports = {
  db,
  query,
  run,
  get,
  addLog
};
