const { query, get, run, addLog } = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await query('SELECT id, nombre, email, user, rol FROM users');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await get('SELECT id, nombre, email, user, rol FROM users WHERE id = ? OR user = ?', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { nombre, email, user, pass, rol } = req.body;

    if (!nombre || !email || !user || !pass || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'El correo electrónico no es válido.' });
    }

    const existing = await get('SELECT id FROM users WHERE user = ? OR email = ?', [user, email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'El nombre de usuario o email ya existe.' });
    }

    const hashedPass = await bcrypt.hash(pass, 10);
    const result = await run('INSERT INTO users (nombre, email, user, pass, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, user, hashedPass, rol]);

    await addLog(`Nuevo usuario creado vía admin/API: ${user} (${rol}).`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: { id: result.id, nombre, email, user, rol }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, user, pass, rol } = req.body;

    const existingUser = await get('SELECT * FROM users WHERE id = ? OR user = ?', [id, id]);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'El correo electrónico no es válido.' });
      }
      const existingEmail = await get('SELECT id FROM users WHERE email = ? AND id != ?', [email, existingUser.id]);
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'El correo electrónico ya está en uso.' });
      }
    }

    const updatedNombre = nombre || existingUser.nombre;
    const updatedEmail = email || existingUser.email;
    const updatedUser = user || existingUser.user;
    const updatedRol = rol || existingUser.rol;
    let updatedPass = existingUser.pass;

    if (pass) {
      updatedPass = await bcrypt.hash(pass, 10);
    }

    await run('UPDATE users SET nombre = ?, email = ?, user = ?, pass = ?, rol = ? WHERE id = ?',
      [updatedNombre, updatedEmail, updatedUser, updatedPass, updatedRol, existingUser.id]);

    await addLog(`Usuario ${existingUser.user} actualizado.`);

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: { id: existingUser.id, nombre: updatedNombre, email: updatedEmail, user: updatedUser, rol: updatedRol }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingUser = await get('SELECT * FROM users WHERE id = ? OR user = ?', [id, id]);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (existingUser.user === 'admin') {
      return res.status(400).json({ success: false, message: 'No se puede eliminar al administrador principal.' });
    }

    await run('DELETE FROM users WHERE id = ?', [existingUser.id]);
    await addLog(`Usuario ${existingUser.user} eliminado.`);

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
