// --- Cliente API REST - PARKING LOT ---

const API_BASE_URL = window.location.origin;

const DB = {
  // Inicialización (ahora no hace nada del lado del cliente)
  init() {
    console.log("Conectado a la API REST de Parking Lot.");
  },

  // --- Usuarios ---
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener usuarios:", e);
      return [];
    }
  },

  async addUser(usuario) {
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/spots`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener puestos:", e);
      return [];
    }
  },

  async occupySpot(spotId, placa) {
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener reservas:", e);
      return [];
    }
  },

  async addReservation(reserva) {
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`);
      return await res.json();
    } catch (e) {
      console.error("Error al obtener transacciones:", e);
      return [];
    }
  },

  // --- Actividades / Logs (Top Feature!) ---
  async getLogs() {
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
