const { request, response } = require('express');
const User = require('../models/user.model');
const { hashPassword } = require('../helpers/password.helper');
const { ROLES, serializeAuthUser } = require('../middlewares/auth.middleware');

const ALLOWED_ROLES = Object.values(ROLES);

const serializeUserManagement = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  active: Boolean(user.active),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const countActiveAdmins = async () => User.countDocuments({ role: ROLES.ADMIN, active: true });

const getUsers = async (_req = request, res = response) => {
  try {
    const users = await User.find().sort({ active: -1, role: 1, name: 1, createdAt: 1 });

    return res.status(200).json({
      users: users.map(serializeUserManagement),
      timestamp: new Date(),
    });
  } catch (error) {
    console.log('Error listing users:');
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      timestamp: new Date(),
    });
  }
};

const postUser = async (req = request, res = response) => {
  const { name, email, password, role, active = true } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: 'Bad Request. Missing required fields: name, email, password, role',
      timestamp: new Date(),
    });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      message: `Bad Request. role must be one of: ${ALLOWED_ROLES.join(', ')}`,
      timestamp: new Date(),
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: 'Bad Request. password must be at least 8 characters long',
      timestamp: new Date(),
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo',
        timestamp: new Date(),
      });
    }

    const passwordHash = await hashPassword(String(password));

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      active: Boolean(active),
    });

    return res.status(201).json({
      user: serializeUserManagement(user),
      timestamp: new Date(),
    });
  } catch (error) {
    console.log('Error creating user:');
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      timestamp: new Date(),
    });
  }
};

const putUser = async (req = request, res = response) => {
  const { id } = req.params;
  const { name, email, role, active } = req.body || {};

  if (!name || !email || !role || typeof active !== 'boolean') {
    return res.status(400).json({
      message: 'Bad Request. Missing required fields: name, email, role, active',
      timestamp: new Date(),
    });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      message: `Bad Request. role must be one of: ${ALLOWED_ROLES.join(', ')}`,
      timestamp: new Date(),
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    const currentUserId = String(req.auth?.user?._id || '');
    const targetUserId = String(user._id);
    const normalizedEmail = String(email).trim().toLowerCase();

    const emailInUse = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailInUse) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo',
        timestamp: new Date(),
      });
    }

    const isAdminBecomingNonAdmin = user.role === ROLES.ADMIN && role !== ROLES.ADMIN;
    const isAdminBeingDeactivated = user.role === ROLES.ADMIN && !active;

    if (targetUserId === currentUserId && (isAdminBecomingNonAdmin || isAdminBeingDeactivated)) {
      return res.status(400).json({
        message: 'No puedes quitarte el acceso de administrador ni desactivarte a ti mismo',
        timestamp: new Date(),
      });
    }

    if (isAdminBecomingNonAdmin || isAdminBeingDeactivated) {
      const activeAdmins = await countActiveAdmins();
      if (activeAdmins <= 1) {
        return res.status(400).json({
          message: 'Debe existir al menos un administrador activo',
          timestamp: new Date(),
        });
      }
    }

    user.name = String(name).trim();
    user.email = normalizedEmail;
    user.role = role;
    user.active = active;
    await user.save();

    return res.status(200).json({
      user: serializeUserManagement(user),
      timestamp: new Date(),
    });
  } catch (error) {
    console.log('Error updating user:');
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      timestamp: new Date(),
    });
  }
};

const resetUserPassword = async (req = request, res = response) => {
  const { id } = req.params;
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({
      message: 'Bad Request. Missing required field: password',
      timestamp: new Date(),
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: 'Bad Request. password must be at least 8 characters long',
      timestamp: new Date(),
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    user.passwordHash = await hashPassword(String(password));
    await user.save();

    return res.status(200).json({
      user: serializeAuthUser(user),
      message: 'Contraseña actualizada',
      timestamp: new Date(),
    });
  } catch (error) {
    console.log('Error resetting user password:');
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      timestamp: new Date(),
    });
  }
};

module.exports = {
  getUsers,
  postUser,
  putUser,
  resetUserPassword,
};
