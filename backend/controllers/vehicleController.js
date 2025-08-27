const Vehicle = require('../models/Vehicle');
const Brand = require('../models/Brand');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { DEMO_MODE } = require('../utils/demoMode');
const { vehicles, brands } = require('../utils/mockData');

// @desc    Obter todos os veículos
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = asyncHandler(async (req, res) => {
  // Verificar se está em modo de demonstração
  if (DEMO_MODE.enabled) {
    console.log('Obtendo veículos em modo de demonstração');

    // Filtrar os dados mock de acordo com os parâmetros de query
    let filteredVehicles = [...vehicles];

    // Filtrar por marca
    if (req.query.brand) {
      filteredVehicles = filteredVehicles.filter(v => v.brand === req.query.brand);
    }

    // Filtrar por modelo
    if (req.query.model) {
      const modelRegex = new RegExp(req.query.model, 'i');
      filteredVehicles = filteredVehicles.filter(v => modelRegex.test(v.model));
    }

    // Filtrar por ano
    if (req.query.year) {
      const searchYear = parseInt(req.query.year);
      filteredVehicles = filteredVehicles.filter(v =>
        (v.yearRange && v.yearRange.start <= searchYear && v.yearRange.end >= searchYear) ||
        v.year === req.query.year
      );
    }

    // Filtrar por categoria
    if (req.query.category) {
      filteredVehicles = filteredVehicles.filter(v => v.category === req.query.category);
    }

    // Paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const total = filteredVehicles.length;

    // Verificar se há página anterior
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    // Verificar se há próxima página
    if (endIndex < total) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    // Paginação dos veículos
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

    // Para cada veículo, adicionar informações da marca
    const vehiclesWithBrands = paginatedVehicles.map(vehicle => {
      const brand = brands.find(b => b._id === vehicle.brand);
      return {
        ...vehicle,
        brand: brand ? { _id: brand._id, name: brand.name, logo: brand.logo } : null,
        diagramCount: vehicle.diagrams ? vehicle.diagrams.length : 0
      };
    });

    return res.status(200).json({
      success: true,
      count: vehiclesWithBrands.length,
      total,
      pagination: results,
      data: vehiclesWithBrands,
    });
  }

  // Modo normal - buscar do banco de dados
  // Construir query
  let query = {};

  // Filtrar por marca
  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  // Filtrar por modelo
  if (req.query.model) {
    query.model = { $regex: req.query.model, $options: 'i' };
  }

  // Filtrar por ano
  if (req.query.year) {
    // Se for um ano específico
    const searchYear = parseInt(req.query.year);
    query.$or = [
      { 'yearRange.start': { $lte: searchYear }, 'yearRange.end': { $gte: searchYear } },
      { year: req.query.year }
    ];
  }

  // Filtrar por categoria
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Paginação
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  const total = await Vehicle.countDocuments(query);

  // Verificar se há página anterior
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit,
    };
  }

  // Verificar se há próxima página
  if (endIndex < total) {
    results.next = {
      page: page + 1,
      limit,
    };
  }

  // Executar query com paginação
  const vehicles = await Vehicle.find(query)
    .populate('brand', 'name logo')
    .sort({ brand: 1, model: 1 })
    .skip(startIndex)
    .limit(limit)
    .lean();

  // Adicionar contagem de diagramas
  const vehiclesWithDiagramCount = vehicles.map(vehicle => ({
    ...vehicle,
    diagramCount: vehicle.diagrams ? vehicle.diagrams.length : 0
  }));

  res.status(200).json({
    success: true,
    count: vehicles.length,
    total,
    pagination: results,
    data: vehiclesWithDiagramCount,
  });
});

// @desc    Obter veículo específico
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = asyncHandler(async (req, res) => {
  // Verificar se está em modo de demonstração
  if (DEMO_MODE.enabled) {
    console.log('Obtendo veículo em modo de demonstração');

    const vehicle = vehicles.find(v => v._id === req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado',
      });
    }

    // Adicionar informações da marca
    const brand = brands.find(b => b._id === vehicle.brand);
    const vehicleWithBrand = {
      ...vehicle,
      brand: brand ? { _id: brand._id, name: brand.name, logo: brand.logo, country: brand.country } : null,
    };

    return res.status(200).json({
      success: true,
      data: vehicleWithBrand,
    });
  }

  // Modo normal - buscar do banco de dados
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('brand', 'name logo country')
    .populate({
      path: 'diagrams',
      select: 'title type category fileUrl thumbnailUrl premium',
      match: { active: true },
    });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Veículo não encontrado',
    });
  }

  // Incrementar visualizações
  vehicle.views += 1;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// @desc    Criar veículo
// @route   POST /api/vehicles
// @access  Private/Admin
exports.createVehicle = asyncHandler(async (req, res) => {
  // Verificar se a marca existe
  const brandExists = await Brand.findById(req.body.brand);
  if (!brandExists) {
    return res.status(404).json({
      success: false,
      message: 'Marca não encontrada',
    });
  }

  // Criar veículo
  const vehicle = await Vehicle.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: vehicle,
  });
});

// @desc    Atualizar veículo
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
exports.updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Veículo não encontrado',
    });
  }

  // Se a marca for alterada, verificar se a nova marca existe
  if (req.body.brand && req.body.brand !== vehicle.brand.toString()) {
    const brandExists = await Brand.findById(req.body.brand);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: 'Marca não encontrada',
      });
    }
  }

  // Atualizar veículo
  vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('brand', 'name logo');

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

// @desc    Excluir veículo
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Veículo não encontrado',
    });
  }

  // Verificar se o veículo tem diagramas
  if (vehicle.diagrams && vehicle.diagrams.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Não é possível excluir o veículo porque ele tem diagramas associados',
    });
  }

  await vehicle.remove();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Veículo excluído com sucesso',
  });
});

// @desc    Upload de imagem do veículo
// @route   POST /api/vehicles/:id/upload-image
// @access  Private/Admin
exports.uploadVehicleImage = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Veículo não encontrado',
    });
  }

  // Verificar se foi enviado arquivo
  if (!req.files || !req.files.image) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, envie um arquivo',
    });
  }

  const file = req.files.image;

  // Verificar se é uma imagem
  if (!file.mimetype.startsWith('image')) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, envie uma imagem',
    });
  }

  // Verificar tamanho
  if (file.size > process.env.MAX_FILE_SIZE) {
    return res.status(400).json({
      success: false,
      message: `Por favor, envie uma imagem menor que ${process.env.MAX_FILE_SIZE / 1000000}MB`,
    });
  }

  // Upload para Cloudinary
  const result = await uploadToCloudinary(file.tempFilePath, 'vehicles');

  // Atualizar veículo
  vehicle.image = result.secure_url;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});