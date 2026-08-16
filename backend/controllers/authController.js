const { get, run, addLog } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { nombre, email, user, pass, rol } = req.body;

    if (!nombre || !email || !user || !pass || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'El correo electrónico no es válido.' });
    }

    // Verificar si ya existe
    const existing = await get('SELECT id FROM users WHERE user = ? OR email = ?', [user, email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'El usuario o correo electrónico ya está registrado.' });
    }

    const hashedPass = await bcrypt.hash(pass, 10);
    await run('INSERT INTO users (nombre, email, user, pass, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, user, hashedPass, rol]);

    await addLog(`Nuevo usuario registrado: ${user} (${rol}).`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: { nombre, email, user, rol }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, pass } = req.body;

    if (!user || !pass) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }

    const foundUser = await get('SELECT * FROM users WHERE user = ?', [user]);
    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    const validPass = await bcrypt.compare(pass, foundUser.pass);
    if (!validPass) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: foundUser.id, user: foundUser.user, rol: foundUser.rol },
      process.env.JWT_SECRET || 'supersecretkeyparkinglot2026',
      { expiresIn: '1d' }
    );

    await addLog(`Usuario ${user} inició sesión (${foundUser.rol}).`);

    res.json({
      success: true,
      message: 'Inicio de sesión correcto',
      token,
      user: {
        nombre: foundUser.nombre,
        email: foundUser.email,
        user: foundUser.user,
        rol: foundUser.rol
      }
    });
  } catch (error) {
    next(error);
  }
};
