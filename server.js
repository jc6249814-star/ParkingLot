const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname)));

const DB_FILE = path.join(__dirname, 'db.json');

// Inicializar la base de datos local (db.json)
function initDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error("Error al leer db.json, reinicializando...", e);
    }
  }

  // Estructura por defecto idéntica a la que tenía db.js
  const defaultDB = {
    users: [
      { nombre: "Jenniffer Castañeda", email: "jenniffer@sena.edu.co", user: "admin", pass: "admin123", rol: "Administrador" },
      { nombre: "Pedro Pérez", email: "pedro@parking.com", user: "operador", pass: "operador123", rol: "Operador" },
      { nombre: "Carlos Restrepo", email: "carlos@gmail.com", user: "carlos", pass: "carlos123", rol: "Cliente" }
    ],
    spots: [],
    reservations: [
      {
        id: 1,
        cliente: "carlos",
        placa: "XYZ-987",
        espacio: "A5",
        fecha: new Date(Date.now() + 3600000 * 2).toISOString(),
        estado: "Activa"
      }
    ],
    transactions: [
      { id: 1, placa: "MNO-456", espacio: "B2", entrada: new Date(Date.now() - 3600000 * 8).toISOString(), salida: new Date(Date.now() - 3600000 * 6).toISOString(), valor: 10000 },
      { id: 2, placa: "QWE-789", espacio: "C1", entrada: new Date(Date.now() - 3600000 * 5).toISOString(), salida: new Date(Date.now() - 3600000 * 4).toISOString(), valor: 5000 },
      { id: 3, placa: "RTY-112", espacio: "A9", entrada: new Date(Date.now() - 3600000 * 2).toISOString(), salida: new Date(Date.now() - 3600000 * 1).toISOString(), valor: 5000 }
    ],
    logs: [
      { timestamp: new Date().toISOString(), action: "Sistema de parqueo inicializado." }
    ]
  };

  // Generar los 30 espacios de parqueo
  const zones = ["A", "B", "C"];
  for (const zone of zones) {
    for (let i = 1; i <= 10; i++) {
      let estado = "Disponible";
      let vehiculo = null;

      if (zone === "A" && i === 2) {
        estado = "Ocupado";
        vehiculo = { placa: "ABC-123", entrada: new Date(Date.now() - 3600000 * 3).toISOString() }; // 3 horas
      } else if (zone === "A" && i === 5) {
        estado = "Reservado";
        vehiculo = { placa: "XYZ-987", cliente: "carlos", fechaReserva: new Date(Date.now() + 3600000 * 2).toISOString() };
      } else if (zone === "B" && i === 3) {
        estado = "Ocupado";
        vehiculo = { placa: "KSM-456", entrada: new Date(Date.now() - 3600000 * 1.5).toISOString() }; // 1.5 horas
      }

      defaultDB.spots.push({
        id: `${zone}${i}`,
        zona: zone,
        numero: i,
        estado: estado,
        vehiculo: vehiculo
      });
    }
  }

  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Cargar DB en memoria al arrancar
let db = initDB();

// Registrar una actividad en los logs
function addLog(action) {
  db.logs.unshift({
    timestamp: new Date().toISOString(),
    action
  });
  // Mantener solo los últimos 50 logs
  if (db.logs.length > 50) {
    db.logs.pop();
  }
}

// --- Endpoints de Autenticación ---
app.post('/api/auth/login', (req, res) => {
  const { user, pass } = req.body;
  const found = db.users.find(u => u.user === user && u.pass === pass);
  if (found) {
    addLog(`Usuario ${user} inició sesión (${found.rol}).`);
    saveDB(db);
    res.json({ success: true, user: found });
  } else {
    res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos." });
  }
});

// --- Endpoints de Espacios de Parqueo ---
app.get('/api/spots', (req, res) => {
  res.json(db.spots);
});

app.post('/api/spots/occupy', (req, res) => {
  const { spotId, placa } = req.body;
  const spot = db.spots.find(s => s.id === spotId);
  if (!spot) {
    return res.status(404).json({ success: false, message: "Espacio no encontrado." });
  }
  if (spot.estado === "Ocupado") {
    return res.status(400).json({ success: false, message: "El espacio ya está ocupado." });
  }

  spot.estado = "Ocupado";
  spot.vehiculo = {
    placa: placa.toUpperCase(),
    entrada: new Date().toISOString()
  };

  addLog(`Vehículo ${placa.toUpperCase()} ingresó al puesto ${spotId}.`);
  saveDB(db);
  res.json({ success: true, spot });
});

app.post('/api/spots/release', (req, res) => {
  const { spotId } = req.body;
  const spot = db.spots.find(s => s.id === spotId);
  if (!spot || spot.estado !== "Ocupado") {
    return res.status(400).json({ success: false, message: "El espacio no está ocupado o no existe." });
  }

  const feePerHour = 5000;
  const fechaEntrada = new Date(spot.vehiculo.entrada);
  const fechaSalida = new Date();
  const diffMs = fechaSalida - fechaEntrada;
  const diffHrs = Math.max(1, Math.ceil(diffMs / 3600000)); // Mínimo 1 hora
  const totalPagar = diffHrs * feePerHour;

  const newTrans = {
    id: Date.now(),
    placa: spot.vehiculo.placa,
    espacio: spot.id,
    entrada: spot.vehiculo.entrada,
    salida: fechaSalida.toISOString(),
    valor: totalPagar
  };

  db.transactions.push(newTrans);

  // Marcar reserva asociada como Completada si existía
  db.reservations = db.reservations.map(r => {
    if (r.espacio === spotId && r.estado === "Activa" && r.placa === spot.vehiculo.placa) {
      return { ...r, estado: "Completada" };
    }
    return r;
  });

  const placaSalida = spot.vehiculo.placa;
  spot.estado = "Disponible";
  spot.vehiculo = null;

  addLog(`Vehículo ${placaSalida} salió del puesto ${spotId}. Cobro total: $${totalPagar}.`);
  saveDB(db);
  res.json({ success: true, transaction: newTrans });
});

// --- Endpoints de Reservas ---
app.get('/api/reservations', (req, res) => {
  res.json(db.reservations);
});

app.post('/api/reservations', (req, res) => {
  const { cliente, placa, espacio, fecha } = req.body;
  const spot = db.spots.find(s => s.id === espacio);

  if (!spot || spot.estado !== "Disponible") {
    return res.status(400).json({ success: false, message: "El espacio no está disponible para reserva." });
  }

  const newRes = {
    id: Date.now(),
    cliente,
    placa: placa.toUpperCase(),
    espacio,
    fecha,
    estado: "Activa"
  };

  db.reservations.push(newRes);

  spot.estado = "Reservado";
  spot.vehiculo = {
    placa: placa.toUpperCase(),
    cliente,
    fechaReserva: fecha
  };

  addLog(`Reserva creada para ${cliente} (Placa: ${placa.toUpperCase()}) en puesto ${espacio}.`);
  saveDB(db);
  res.json({ success: true, reservation: newRes });
});

app.post('/api/reservations/cancel', (req, res) => {
  const { reservationId } = req.body;
  const resIdx = db.reservations.findIndex(r => r.id === Number(reservationId));
  if (resIdx === -1) {
    return res.status(404).json({ success: false, message: "Reserva no encontrada." });
  }

  const reservation = db.reservations[resIdx];
  reservation.estado = "Cancelada";

  // Liberar el espacio si sigue reservado por esta misma placa
  const spot = db.spots.find(s => s.id === reservation.espacio);
  if (spot && spot.estado === "Reservado" && spot.vehiculo && spot.vehiculo.placa === reservation.placa) {
    spot.estado = "Disponible";
    spot.vehiculo = null;
  }

  addLog(`Reserva #${reservationId} cancelada para puesto ${reservation.espacio}.`);
  saveDB(db);
  res.json({ success: true });
});

// --- Endpoints de Usuarios ---
app.get('/api/users', (req, res) => {
  // Retornamos sin las contraseñas por seguridad (aunque sea local)
  res.json(db.users.map(u => ({ nombre: u.nombre, email: u.email, user: u.user, rol: u.rol })));
});

app.post('/api/users', (req, res) => {
  const { nombre, email, user, pass, rol } = req.body;
  if (db.users.some(u => u.user === user)) {
    return res.status(400).json({ success: false, message: "El nombre de usuario ya está registrado." });
  }

  const newUser = { nombre, email, user, pass, rol };
  db.users.push(newUser);
  addLog(`Nuevo usuario registrado: ${user} (${rol}).`);
  saveDB(db);
  res.json({ success: true });
});

app.delete('/api/users/:username', (req, res) => {
  const username = req.params.username;
  if (username === 'admin') {
    return res.status(400).json({ success: false, message: "No se puede eliminar al administrador principal." });
  }
  const lengthBefore = db.users.length;
  db.users = db.users.filter(u => u.user !== username);
  if (db.users.length < lengthBefore) {
    addLog(`Usuario ${username} eliminado.`);
    saveDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Usuario no encontrado." });
  }
});

// --- Endpoints de Transacciones y Logs ---
app.get('/api/transactions', (req, res) => {
  res.json(db.transactions);
});

app.get('/api/logs', (req, res) => {
  res.json(db.logs);
});

// --- Endpoint de Estadísticas ---
app.get('/api/stats', (req, res) => {
  const ocupados = db.spots.filter(s => s.estado === "Ocupado").length;
  const disponibles = db.spots.filter(s => s.estado === "Disponible").length;
  const reservados = db.spots.filter(s => s.estado === "Reservado").length;

  const hoy = new Date().toDateString();
  const ingresosHoy = db.transactions
    .filter(t => new Date(t.salida).toDateString() === hoy)
    .reduce((sum, t) => sum + t.valor, 0);

  res.json({
    ocupados,
    disponibles,
    reservados,
    ingresosHoy,
    totalSpots: db.spots.length
  });
});

// Resetear base de datos por completo
app.post('/api/db/reset', (req, res) => {
  fs.unlinkSync(DB_FILE);
  db = initDB();
  addLog("Base de datos restablecida por completo.");
  saveDB(db);
  res.json({ success: true, message: "Base de datos restablecida a los valores por defecto." });
});

app.listen(PORT, () => {
  console.log(`Servidor de Parking Lot ejecutándose en http://localhost:${PORT}`);
});
