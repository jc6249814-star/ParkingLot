const { query, get, run } = require('../config/database');

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await query('SELECT * FROM transactions');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const t = await get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!t) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }
    res.json(t);
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { placa, espacio, entrada, salida, valor } = req.body;

    if (!placa || !espacio || !entrada || !salida || valor === undefined) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const result = await run('INSERT INTO transactions (placa, espacio, entrada, salida, valor) VALUES (?, ?, ?, ?, ?)',
      [placa.toUpperCase(), espacio, entrada, salida, valor]);

    res.status(201).json({
      success: true,
      message: 'Transacción creada correctamente',
      data: { id: result.id, placa: placa.toUpperCase(), espacio, entrada, salida, valor }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { placa, espacio, entrada, salida, valor } = req.body;

    const existing = await get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    const updatedPlaca = placa || existing.placa;
    const updatedEspacio = espacio || existing.espacio;
    const updatedEntrada = entrada || existing.entrada;
    const updatedSalida = salida || existing.salida;
    const updatedValor = valor !== undefined ? valor : existing.valor;

    await run('UPDATE transactions SET placa = ?, espacio = ?, entrada = ?, salida = ?, valor = ? WHERE id = ?',
      [updatedPlaca.toUpperCase(), updatedEspacio, updatedEntrada, updatedSalida, updatedValor, id]);

    res.json({
      success: true,
      message: 'Transacción actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    await run('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Transacción eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};
