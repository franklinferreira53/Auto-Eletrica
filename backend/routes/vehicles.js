const express = require('express');
const { body } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const vehicleValidation = [
  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Marca deve ter entre 1 e 50 caracteres'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Modelo deve ter entre 1 e 100 caracteres'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano deve ser válido'),
  body('category')
    .isIn(['carro', 'moto', 'caminhao', 'onibus', 'van'])
    .withMessage('Categoria deve ser válida'),
  body('fuelType')
    .isIn(['gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido'])
    .withMessage('Tipo de combustível deve ser válido'),
  body('transmission')
    .optional()
    .isIn(['manual', 'automatico', 'cvt'])
    .withMessage('Tipo de transmissão deve ser válido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
];

// @route   GET /api/vehicles/search
// @desc    Search vehicles
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Termo de busca deve ter pelo menos 2 caracteres' });
    }

    const vehicles = await Vehicle.search(q.trim())
      .populate('createdBy', 'name')
      .limit(20);

    res.json({ vehicles });
  } catch (error) {
    console.error('Search vehicles error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/vehicles/stats/overview
// @desc    Get vehicle statistics
// @access  Private/Admin
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ isActive: true });
    const vehiclesByCategory = await Vehicle.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const vehiclesByFuelType = await Vehicle.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$fuelType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const recentVehicles = await Vehicle.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats: {
        total: totalVehicles,
        byCategory: vehiclesByCategory,
        byFuelType: vehiclesByFuelType,
        recentAdditions: recentVehicles
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;
    const fuelType = req.query.fuelType;
    const brand = req.query.brand;

    let query = { isActive: true };
    
    // Build search query
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { brand: searchRegex },
        { model: searchRegex },
        { description: searchRegex }
      ];
    }

    // Add filters
    if (category) query.category = category;
    if (fuelType) query.fuelType = fuelType;
    if (brand) query.brand = new RegExp(brand, 'i');

    const vehicles = await Vehicle.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments(query);

    // Get filter options for frontend
    const brands = await Vehicle.distinct('brand', { isActive: true });
    const categories = await Vehicle.distinct('category', { isActive: true });
    const fuelTypes = await Vehicle.distinct('fuelType', { isActive: true });

    res.json({
      vehicles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      filters: {
        brands: brands.sort(),
        categories: categories.sort(),
        fuelTypes: fuelTypes.sort()
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true })
      .populate('createdBy', 'name');
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de veículo inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private
router.post('/', auth, vehicleValidation, handleValidationErrors, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      createdBy: req.user._id
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Populate createdBy for response
    await vehicle.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Veículo criado com sucesso',
      vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (admin or owner)
router.put('/:id', auth, vehicleValidation, handleValidationErrors, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && vehicle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode editar seus próprios veículos' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json({
      message: 'Veículo atualizado com sucesso',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de veículo inválido' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle (soft delete)
// @access  Private (admin or owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && vehicle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar seus próprios veículos' });
    }

    // Soft delete
    vehicle.isActive = false;
    await vehicle.save();

    res.json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de veículo inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;