// --- Cliente de Base de Datos / API REST - PARKING LOT ---

// Si estamos en localhost, apuntar al puerto del servidor backend (3000) por defecto si la app corre en otro puerto (ej: Live Server en puerto 5500)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3000' 
  : window.location.origin;

// Detectar si la app está corriendo en GitHub Pages o de forma local con doble clic (archivo local)
// En estos casos, no hay un servidor Express corriendo para recibir peticiones, por lo que usaremos localStorage como fallback.
const USE_FALLBACK = window.location.hostname.includes('github.io') || 
                     window.location.protocol === 'file:' || 
                     window.location.hostname === '';

// --- CONFIGURACIÓN DE BASE DE DATOS LOCAL (FALLBACK) ---
const LOCAL_STORAGE_KEY = "parking_lot_db_fallback";

function getLocalDB() {
  let localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!localData) {
    // Inicializar base de datos por defecto si no existe
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
        { timestamp: new Date().toISOString(), action: "Sistema de parqueo inicializado (Modo local/GitHub Pages)." }
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
    saveLocalDB(defaultDB);
    return defaultDB;
  }
  return JSON.parse(localData);
}

function saveLocalDB(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data, null, 2));
}

function addLocalLog(db, action) {
  db.logs.unshift({
    timestamp: new Date().toISOString(),
    action
  });
  if (db.logs.length > 50) {
    db.logs.pop();
  }
}

// --- OBJETO DB PRINCIPAL CON SOPORTE HÍBRIDO (API / LOCAL FALLBACK) ---
const DB = {
  init() {
    if (USE_FALLBACK) {
      console.log("⚠️ Modo de compatibilidad local activado (sin servidor). Los datos se guardarán en localStorage.");
      getLocalDB(); // Fuerza inicialización si no existe
    } else {
      console.log("🔌 Conectado a la API REST de Parking Lot.");
    }
  },

  // --- Usuarios ---
  async getUsers() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      // Retornar sin contraseñas por consistencia con la API
      return db.users.map(u => ({ nombre: u.nombre, email: u.email, user: u.user, rol: u.rol }));
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener usuarios:", e);
      return [];
    }
  },

  async addUser(usuario) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      if (db.users.some(u => u.user === usuario.user)) {
        return { success: false, message: "El nombre de usuario ya está registrado." };
      }
      db.users.push(usuario);
      addLocalLog(db, `Nuevo usuario registrado: ${usuario.user} (${usuario.rol}).`);
      saveLocalDB(db);
      return { success: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });
      return await res.json();
    } catch (e) {
      console.error("Error al agregar usuario:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  },

  async deleteUser(username) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      if (username === 'admin') {
        return { success: false, message: "No se puede eliminar al administrador principal." };
      }
      const lengthBefore = db.users.length;
      db.users = db.users.filter(u => u.user !== username);
      if (db.users.length < lengthBefore) {
        addLocalLog(db, `Usuario ${username} eliminado.`);
        saveLocalDB(db);
        return { success: true };
      }
      return { success: false, message: "Usuario no encontrado." };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${username}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e) {
      console.error("Error al eliminar usuario:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  },

  async login(user, pass) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const found = db.users.find(u => u.user === user && u.pass === pass);
      if (found) {
        addLocalLog(db, `Usuario ${user} inició sesión (${found.rol}).`);
        saveLocalDB(db);
        localStorage.setItem("parking_session", JSON.stringify(found));
        return { success: true, user: found };
      }
      return { success: false, message: "Usuario o contraseña incorrectos." };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("parking_session", JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || "Usuario o contraseña incorrectos." };
    } catch (e) {
      console.error("Error al iniciar sesión:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  },

  logout() {
    localStorage.removeItem("parking_session");
  },

  getCurrentSession() {
    return JSON.parse(localStorage.getItem("parking_session"));
  },

  // --- Espacios de Parqueo ---
  async getSpots() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      return db.spots;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/spots`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener puestos:", e);
      return [];
    }
  },

  async occupySpot(spotId, placa) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const spot = db.spots.find(s => s.id === spotId);
      if (!spot) {
        return { success: false, message: "Espacio no encontrado." };
      }
      if (spot.estado === "Ocupado") {
        return { success: false, message: "El espacio ya está ocupado." };
      }

      spot.estado = "Ocupado";
      spot.vehiculo = {
        placa: placa.toUpperCase(),
        entrada: new Date().toISOString()
      };

      addLocalLog(db, `Vehículo ${placa.toUpperCase()} ingresó al puesto ${spotId}.`);
      saveLocalDB(db);
      return { success: true, spot };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/spots/occupy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId, placa })
      });
      return await res.json();
    } catch (e) {
      console.error("Error al ocupar puesto:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  },

  async releaseSpot(spotId) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const spot = db.spots.find(s => s.id === spotId);
      if (!spot || spot.estado !== "Ocupado") {
        return null;
      }

      const feePerHour = 5000;
      const fechaEntrada = new Date(spot.vehiculo.entrada);
      const fechaSalida = new Date();
      const diffMs = fechaSalida - fechaEntrada;
      const diffHrs = Math.max(1, Math.ceil(diffMs / 3600000));
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

      // Marcar reserva asociada como completada
      db.reservations = db.reservations.map(r => {
        if (r.espacio === spotId && r.estado === "Activa" && r.placa === spot.vehiculo.placa) {
          return { ...r, estado: "Completada" };
        }
        return r;
      });

      const placaSalida = spot.vehiculo.placa;
      spot.estado = "Disponible";
      spot.vehiculo = null;

      addLocalLog(db, `Vehículo ${placaSalida} salió del puesto ${spotId}. Cobro total: $${totalPagar}.`);
      saveLocalDB(db);
      return newTrans;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/spots/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.transaction;
      }
      return null;
    } catch (e) {
      console.error("Error al liberar puesto:", e);
      return null;
    }
  },

  // --- Reservas ---
  async getReservations() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      return db.reservations;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener reservas:", e);
      return [];
    }
  },

  async addReservation(reserva) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const spot = db.spots.find(s => s.id === reserva.espacio);
      if (!spot || spot.estado !== "Disponible") {
        return { success: false, message: "El espacio no está disponible para reserva." };
      }

      const newRes = {
        id: Date.now(),
        cliente: reserva.cliente,
        placa: reserva.placa.toUpperCase(),
        espacio: reserva.espacio,
        fecha: reserva.fecha,
        estado: "Activa"
      };

      db.reservations.push(newRes);

      spot.estado = "Reservado";
      spot.vehiculo = {
        placa: reserva.placa.toUpperCase(),
        cliente: reserva.cliente,
        fechaReserva: reserva.fecha
      };

      addLocalLog(db, `Reserva creada para ${reserva.cliente} (Placa: ${reserva.placa.toUpperCase()}) en puesto ${reserva.espacio}.`);
      saveLocalDB(db);
      return { success: true, reservation: newRes };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reserva)
      });
      return await res.json();
    } catch (e) {
      console.error("Error al agregar reserva:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  },

  async cancelReservation(reservationId) {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const resIdx = db.reservations.findIndex(r => r.id === Number(reservationId));
      if (resIdx === -1) {
        return false;
      }

      const reservation = db.reservations[resIdx];
      reservation.estado = "Cancelada";

      const spot = db.spots.find(s => s.id === reservation.espacio);
      if (spot && spot.estado === "Reservado" && spot.vehiculo && spot.vehiculo.placa === reservation.placa) {
        spot.estado = "Disponible";
        spot.vehiculo = null;
      }

      addLocalLog(db, `Reserva #${reservationId} cancelada para puesto ${reservation.espacio}.`);
      saveLocalDB(db);
      return true;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId })
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error("Error al cancelar reserva:", e);
      return false;
    }
  },

  // --- Transacciones ---
  async getTransactions() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      return db.transactions;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener transacciones:", e);
      return [];
    }
  },

  // --- Actividades / Logs ---
  async getLogs() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      return db.logs;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener logs:", e);
      return [];
    }
  },

  // --- Estadísticas del Dashboard ---
  async getStats() {
    if (USE_FALLBACK) {
      const db = getLocalDB();
      const ocupados = db.spots.filter(s => s.estado === "Ocupado").length;
      const disponibles = db.spots.filter(s => s.estado === "Disponible").length;
      const reservados = db.spots.filter(s => s.estado === "Reservado").length;

      const hoy = new Date().toDateString();
      const ingresosHoy = db.transactions
        .filter(t => new Date(t.salida).toDateString() === hoy)
        .reduce((sum, t) => sum + t.valor, 0);

      return {
        ocupados,
        disponibles,
        reservados,
        ingresosHoy,
        totalSpots: db.spots.length
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener estadísticas:", e);
      return { ocupados: 0, disponibles: 30, reservados: 0, ingresosHoy: 0, totalSpots: 30 };
    }
  },

  // --- Restablecer BD ---
  async resetDatabase() {
    if (USE_FALLBACK) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      getLocalDB(); // Fuerza inicialización limpia
      return { success: true, message: "Base de datos restablecida a los valores por defecto." };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/db/reset`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.error("Error al restablecer la base de datos:", e);
      return { success: false, message: "Error de conexión con el servidor." };
    }
  }
};

// Auto-inicializar
DB.init();
window.DB = DB;
