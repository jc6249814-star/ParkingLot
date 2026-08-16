const { query, get } = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const spots = await query('SELECT estado FROM spots');
    const ocupados = spots.filter(s => s.estado === 'Ocupado').length;
    const disponibles = spots.filter(s => s.estado === 'Disponible').length;
    const reservados = spots.filter(s => s.estado === 'Reservado').length;

    // Calcular ingresos totales y transacciones
    const trans = await query('SELECT valor, salida FROM transactions');
    const totalTransacciones = trans.length;
    const ingresos = trans.reduce((sum, t) => sum + t.valor, 0);

    const hoy = new Date().toDateString();
    const ingresosHoy = trans
      .filter(t => new Date(t.salida).toDateString() === hoy)
      .reduce((sum, t) => sum + t.valor, 0);

    // Conteo total de reservas
    const resCount = await get('SELECT COUNT(*) as count FROM reservations');

    res.json({
      ocupados,
      disponibles,
      reservados,
      totalSpots: spots.length,
      totalReservas: resCount.count,
      totalTransacciones,
      ingresos,
      ingresosHoy
    });
  } catch (error) {
    next(error);
  }
};
