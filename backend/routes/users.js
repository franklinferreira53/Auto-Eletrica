const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth, adminOnly, adminOrOwner } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role deve ser user ou admin')
];

// @route   GET /api/users/stats/overview
// @desc    Get user statistics
// @access  Private/Admin
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        recentRegistrations: recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (admin or own profile)
router.get('/:id', auth, adminOrOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin or own profile)
router.put('/:id', auth, adminOrOwner, updateUserValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Only admin can change role and isActive
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    // Update user fields
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role && req.user.role === 'admin') updates.role = role;
    if (typeof isActive === 'boolean' && req.user.role === 'admin') updates.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete/deactivate user
// @access  Private/Admin
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;