const { query, get, run, addLog } = require('../config/database');

exports.getSpots = async (req, res, next) => {
  try {
    const spots = await query('SELECT * FROM spots');
    
    // Formatear vehiculo de forma compatible con el frontend estructurado en memoria
    const formattedSpots = spots.map(s => {
      let vehiculo = null;
      if (s.estado === 'Ocupado') {
        vehiculo = { placa: s.placa, entrada: s.entrada };
      } else if (s.estado === 'Reservado') {
        vehiculo = { placa: s.placa, cliente: s.cliente, fechaReserva: s.fechaReserva };
      }
      return {
        id: s.id,
        zona: s.zona,
        numero: s.numero,
        estado: s.estado,
        vehiculo: vehiculo
      };
    });

    res.json(formattedSpots);
  } catch (error) {
    next(error);
  }
};

exports.getSpotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const s = await get('SELECT * FROM spots WHERE id = ?', [id]);
    if (!s) {
      return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
    }

    let vehiculo = null;
    if (s.estado === 'Ocupado') {
      vehiculo = { placa: s.placa, entrada: s.entrada };
    } else if (s.estado === 'Reservado') {
      vehiculo = { placa: s.placa, cliente: s.cliente, fechaReserva: s.fechaReserva };
    }

    res.json({
      id: s.id,
      zona: s.zona,
      numero: s.numero,
      estado: s.estado,
      vehiculo: vehiculo
    });
  } catch (error) {
    next(error);
  }
};

exports.createSpot = async (req, res, next) => {
  try {
    const { id, zona, numero, estado } = req.body;

    if (!id || !zona || !numero) {
      return res.status(400).json({ success: false, message: 'ID, zona y número son obligatorios' });
    }

    const existing = await get('SELECT id FROM spots WHERE id = ?', [id]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'El espacio con este ID ya existe' });
    }

    await run('INSERT INTO spots (id, zona, numero, estado) VALUES (?, ?, ?, ?)',
      [id, zona, numero, estado || 'Disponible']);

    await addLog(`Nuevo espacio creado: ${id} en Zona ${zona}.`);

    res.status(201).json({
      success: true,
      message: 'Espacio creado correctamente',
      data: { id, zona, numero, estado: estado || 'Disponible' }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSpot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { zona, numero, estado, placa, entrada, cliente, fechaReserva } = req.body;

    const existing = await get('SELECT * FROM spots WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
    }

    const updatedZona = zona || existing.zona;
    const updatedNumero = numero !== undefined ? numero : existing.numero;
    const updatedEstado = estado || existing.estado;
    const updatedPlaca = placa !== undefined ? placa : existing.placa;
    const updatedEntrada = entrada !== undefined ? entrada : existing.entrada;
    const updatedCliente = cliente !== undefined ? cliente : existing.cliente;
    const updatedFechaReserva = fechaReserva !== undefined ? fechaReserva : existing.fechaReserva;

    await run('UPDATE spots SET zona = ?, numero = ?, estado = ?, placa = ?, entrada = ?, cliente = ?, fechaReserva = ? WHERE id = ?',
      [updatedZona, updatedNumero, updatedEstado, updatedPlaca, updatedEntrada, updatedCliente, updatedFechaReserva, id]);

    res.json({
      success: true,
      message: 'Espacio actualizado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT * FROM spots WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
    }

    await run('DELETE FROM spots WHERE id = ?', [id]);
    await addLog(`Espacio ${id} eliminado.`);

    res.json({
      success: true,
      message: 'Espacio eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Ocupar Espacio (Equivalente al /api/spots/occupy original del server)
exports.occupySpot = async (req, res, next) => {
  try {
    const { spotId, placa } = req.body;
    if (!spotId || !placa) {
      return res.status(400).json({ success: false, message: 'El ID del espacio y la placa son obligatorios.' });
    }

    const spot = await get('SELECT * FROM spots WHERE id = ?', [spotId]);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Espacio no encontrado.' });
    }
    if (spot.estado === 'Ocupado') {
      return res.status(400).json({ success: false, message: 'El espacio ya está ocupado.' });
    }

    const fechaEntrada = new Date().toISOString();
    await run('UPDATE spots SET estado = ?, placa = ?, entrada = ?, cliente = NULL, fechaReserva = NULL WHERE id = ?',
      ['Ocupado', placa.toUpperCase(), fechaEntrada, spotId]);

    await addLog(`Vehículo ${placa.toUpperCase()} ingresó al puesto ${spotId}.`);

    res.json({
      success: true,
      spot: {
        id: spotId,
        zona: spot.zona,
        numero: spot.numero,
        estado: 'Ocupado',
        vehiculo: { placa: placa.toUpperCase(), entrada: fechaEntrada }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Liberar Espacio (Equivalente al /api/spots/release original del server)
exports.releaseSpot = async (req, res, next) => {
  try {
    const { spotId } = req.body;
    if (!spotId) {
      return res.status(400).json({ success: false, message: 'El ID del espacio es obligatorio.' });
    }

    const spot = await get('SELECT * FROM spots WHERE id = ?', [spotId]);
    if (!spot || spot.estado !== 'Ocupado') {
      return res.status(400).json({ success: false, message: 'El espacio no está ocupado o no existe.' });
    }

    const feePerHour = 5000;
    const fechaEntrada = new Date(spot.entrada);
    const fechaSalida = new Date();
    const diffMs = fechaSalida - fechaEntrada;
    const diffHrs = Math.max(1, Math.ceil(diffMs / 3600000)); // Mínimo 1 hora
    const totalPagar = diffHrs * feePerHour;

    // Crear Transacción
    const result = await run('INSERT INTO transactions (placa, espacio, entrada, salida, valor) VALUES (?, ?, ?, ?, ?)',
      [spot.placa, spot.id, spot.entrada, fechaSalida.toISOString(), totalPagar]);

    const newTrans = {
      id: result.id,
      placa: spot.placa,
      espacio: spot.id,
      entrada: spot.entrada,
      salida: fechaSalida.toISOString(),
      valor: totalPagar
    };

    // Marcar reservas asociadas a esta placa y espacio como completadas
    await run("UPDATE reservations SET estado = 'Completada' WHERE espacio = ? AND estado = 'Activa' AND placa = ?",
      [spotId, spot.placa]);

    // Liberar espacio
    await run('UPDATE spots SET estado = ?, placa = NULL, entrada = NULL, cliente = NULL, fechaReserva = NULL WHERE id = ?',
      ['Disponible', spotId]);

    await addLog(`Vehículo ${spot.placa} salió del puesto ${spotId}. Cobro total: $${totalPagar}.`);

    res.json({ success: true, transaction: newTrans });
  } catch (error) {
    next(error);
  }
};
