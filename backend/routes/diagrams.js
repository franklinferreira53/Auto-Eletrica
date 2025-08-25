const express = require('express');
const { body } = require('express-validator');
const Diagram = require('../models/Diagram');
const Vehicle = require('../models/Vehicle');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const diagramValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  body('vehicle')
    .isMongoId()
    .withMessage('ID do veículo inválido'),
  body('category')
    .isIn(['alarme', 'rastreamento', 'som_automotivo', 'ar_condicionado', 'vidro_eletrico', 'trava_eletrica', 'sistema_injecao', 'ignicao_eletronica', 'outros'])
    .withMessage('Categoria deve ser válida'),
  body('difficulty')
    .optional()
    .isIn(['basico', 'intermediario', 'avancado'])
    .withMessage('Dificuldade deve ser válida'),
  body('estimatedTime')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tempo estimado deve ter no máximo 50 caracteres'),
  body('steps')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um passo é obrigatório'),
  body('steps.*.title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título do passo deve ter entre 5 e 200 caracteres'),
  body('steps.*.description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição do passo deve ter entre 10 e 1000 caracteres'),
  body('steps.*.order')
    .isInt({ min: 1 })
    .withMessage('Ordem do passo deve ser um número positivo')
];

// @route   GET /api/diagrams/search
// @desc    Search diagrams
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, difficulty, vehicle } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Termo de busca deve ter pelo menos 2 caracteres' });
    }

    const filters = {};
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (vehicle) filters.vehicle = vehicle;

    const diagrams = await Diagram.search(q.trim(), filters)
      .limit(20);

    res.json({ diagrams });
  } catch (error) {
    console.error('Search diagrams error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/diagrams/stats/overview
// @desc    Get diagram statistics
// @access  Private/Admin
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalDiagrams = await Diagram.countDocuments({ isActive: true });
    const publicDiagrams = await Diagram.countDocuments({ isPublic: true, isActive: true });
    const diagramsByCategory = await Diagram.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const diagramsByDifficulty = await Diagram.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const recentDiagrams = await Diagram.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const totalViews = await Diagram.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    res.json({
      stats: {
        total: totalDiagrams,
        public: publicDiagrams,
        private: totalDiagrams - publicDiagrams,
        byCategory: diagramsByCategory,
        byDifficulty: diagramsByDifficulty,
        recentAdditions: recentDiagrams,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    console.error('Get diagram stats error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/diagrams
// @desc    Get all diagrams
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const vehicle = req.query.vehicle;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = { isPublic: true, isActive: true };
    
    // Build search query
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Add filters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (vehicle) query.vehicle = vehicle;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const diagrams = await Diagram.find(query)
      .populate('vehicle', 'brand model year')
      .populate('createdBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Diagram.countDocuments(query);

    // Get filter options for frontend
    const categories = await Diagram.distinct('category', { isPublic: true, isActive: true });
    const difficulties = await Diagram.distinct('difficulty', { isPublic: true, isActive: true });

    res.json({
      diagrams,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      filters: {
        categories: categories.sort(),
        difficulties: difficulties.sort()
      }
    });
  } catch (error) {
    console.error('Get diagrams error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   GET /api/diagrams/:id
// @desc    Get diagram by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ 
      _id: req.params.id, 
      isPublic: true, 
      isActive: true 
    })
      .populate('vehicle', 'brand model year category fuelType')
      .populate('createdBy', 'name')
      .populate('likes.user', 'name');
    
    if (!diagram) {
      return res.status(404).json({ message: 'Diagrama não encontrado' });
    }

    // Increment views
    await diagram.incrementViews();

    // Check if current user liked this diagram
    let isLiked = false;
    if (req.user) {
      isLiked = diagram.likes.some(like => like.user._id.toString() === req.user._id.toString());
    }

    res.json({ 
      diagram: {
        ...diagram.toJSON(),
        isLiked
      }
    });
  } catch (error) {
    console.error('Get diagram error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de diagrama inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/diagrams
// @desc    Create a new diagram
// @access  Private
router.post('/', auth, diagramValidation, handleValidationErrors, async (req, res) => {
  try {
    // Verify vehicle exists
    const vehicle = await Vehicle.findOne({ _id: req.body.vehicle, isActive: true });
    if (!vehicle) {
      return res.status(400).json({ message: 'Veículo não encontrado' });
    }

    const diagramData = {
      ...req.body,
      createdBy: req.user._id
    };

    const diagram = new Diagram(diagramData);
    await diagram.save();

    // Populate for response
    await diagram.populate([
      { path: 'vehicle', select: 'brand model year' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      message: 'Diagrama criado com sucesso',
      diagram
    });
  } catch (error) {
    console.error('Create diagram error:', error);
    
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

// @route   PUT /api/diagrams/:id
// @desc    Update diagram
// @access  Private (admin or owner)
router.put('/:id', auth, diagramValidation, handleValidationErrors, async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id);
    
    if (!diagram) {
      return res.status(404).json({ message: 'Diagrama não encontrado' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && diagram.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode editar seus próprios diagramas' });
    }

    // Verify vehicle exists if changed
    if (req.body.vehicle && req.body.vehicle !== diagram.vehicle.toString()) {
      const vehicle = await Vehicle.findOne({ _id: req.body.vehicle, isActive: true });
      if (!vehicle) {
        return res.status(400).json({ message: 'Veículo não encontrado' });
      }
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const updatedDiagram = await Diagram.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'vehicle', select: 'brand model year' },
      { path: 'createdBy', select: 'name' },
      { path: 'updatedBy', select: 'name' }
    ]);

    res.json({
      message: 'Diagrama atualizado com sucesso',
      diagram: updatedDiagram
    });
  } catch (error) {
    console.error('Update diagram error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de diagrama inválido' });
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

// @route   DELETE /api/diagrams/:id
// @desc    Delete diagram (soft delete)
// @access  Private (admin or owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id);
    
    if (!diagram) {
      return res.status(404).json({ message: 'Diagrama não encontrado' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && diagram.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar seus próprios diagramas' });
    }

    // Soft delete
    diagram.isActive = false;
    diagram.updatedBy = req.user._id;
    await diagram.save();

    res.json({ message: 'Diagrama removido com sucesso' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de diagrama inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/diagrams/:id/like
// @desc    Like/unlike a diagram
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ 
      _id: req.params.id, 
      isPublic: true, 
      isActive: true 
    });
    
    if (!diagram) {
      return res.status(404).json({ message: 'Diagrama não encontrado' });
    }

    const userLikeIndex = diagram.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    let message;
    if (userLikeIndex > -1) {
      // Remove like
      diagram.likes.splice(userLikeIndex, 1);
      message = 'Like removido';
    } else {
      // Add like
      diagram.likes.push({ user: req.user._id });
      message = 'Diagrama curtido';
    }

    await diagram.save();

    res.json({ 
      message,
      likeCount: diagram.likes.length,
      isLiked: userLikeIndex === -1
    });
  } catch (error) {
    console.error('Like diagram error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de diagrama inválido' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;