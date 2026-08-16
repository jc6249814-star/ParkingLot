const { query } = require('../config/database');

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await query('SELECT timestamp, action FROM logs ORDER BY timestamp DESC LIMIT 50');
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
