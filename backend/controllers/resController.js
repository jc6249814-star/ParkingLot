const { query, get, run, addLog } = require('../config/database');

exports.getReservations = async (req, res, next) => {
  try {
    const reservations = await query('SELECT * FROM reservations');
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await get('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!r) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    res.json(r);
  } catch (error) {
    next(error);
  }
};

exports.createReservation = async (req, res, next) => {
  try {
    const { cliente, placa, espacio, fecha } = req.body;

    if (!cliente || !placa || !espacio || !fecha) {
      return res.status(400).json({ success: false, message: 'Todos los campos de la reserva son obligatorios.' });
    }

    const spot = await get('SELECT * FROM spots WHERE id = ?', [espacio]);
    if (!spot || spot.estado !== 'Disponible') {
      return res.status(400).json({ success: false, message: 'El espacio no está disponible para reserva.' });
    }

    // Insertar reserva
    const result = await run('INSERT INTO reservations (cliente, placa, espacio, fecha, estado) VALUES (?, ?, ?, ?, ?)',
      [cliente, placa.toUpperCase(), espacio, fecha, 'Activa']);

    // Actualizar puesto a Reservado
    await run('UPDATE spots SET estado = ?, placa = ?, cliente = ?, fechaReserva = ? WHERE id = ?',
      ['Reservado', placa.toUpperCase(), cliente, fecha, espacio]);

    await addLog(`Reserva creada para ${cliente} (Placa: ${placa.toUpperCase()}) en puesto ${espacio}.`);

    res.status(201).json({
      success: true,
      reservation: {
        id: result.id,
        cliente,
        placa: placa.toUpperCase(),
        espacio,
        fecha,
        estado: 'Activa'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cliente, placa, espacio, fecha, estado } = req.body;

    const existing = await get('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    const updatedCliente = cliente || existing.cliente;
    const updatedPlaca = placa || existing.placa;
    const updatedEspacio = espacio || existing.espacio;
    const updatedFecha = fecha || existing.fecha;
    const updatedEstado = estado || existing.estado;

    await run('UPDATE reservations SET cliente = ?, placa = ?, espacio = ?, fecha = ?, estado = ? WHERE id = ?',
      [updatedCliente, updatedPlaca.toUpperCase(), updatedEspacio, updatedFecha, updatedEstado, id]);

    res.json({
      success: true,
      message: 'Reserva actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
    }

    // Cambiar estado a Cancelada
    await run("UPDATE reservations SET estado = 'Cancelada' WHERE id = ?", [id]);

    // Liberar el espacio de parqueo correspondiente si sigue reservado por la misma placa
    const spot = await get('SELECT * FROM spots WHERE id = ?', [reservation.espacio]);
    if (spot && spot.estado === 'Reservado' && spot.placa === reservation.placa) {
      await run('UPDATE spots SET estado = ?, placa = NULL, entrada = NULL, cliente = NULL, fechaReserva = NULL WHERE id = ?',
        ['Disponible', reservation.espacio]);
    }

    await addLog(`Reserva #${id} cancelada para puesto ${reservation.espacio}.`);

    res.json({ success: true, message: 'Reserva cancelada correctamente' });
  } catch (error) {
    next(error);
  }
};

// Cancelar Reserva (Equivalente al /api/reservations/cancel original del server)
exports.cancelReservationPost = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ success: false, message: 'El ID de la reserva es obligatorio.' });
    }

    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
    }

    await run("UPDATE reservations SET estado = 'Cancelada' WHERE id = ?", [reservationId]);

    const spot = await get('SELECT * FROM spots WHERE id = ?', [reservation.espacio]);
    if (spot && spot.estado === 'Reservado' && spot.placa === reservation.placa) {
      await run('UPDATE spots SET estado = ?, placa = NULL, entrada = NULL, cliente = NULL, fechaReserva = NULL WHERE id = ?',
        ['Disponible', reservation.espacio]);
    }

    await addLog(`Reserva #${reservationId} cancelada para puesto ${reservation.espacio}.`);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
