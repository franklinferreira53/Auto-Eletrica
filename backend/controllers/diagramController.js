const Diagram = require('../models/Diagram');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../utils/cloudinary');
const { DEMO_MODE } = require('../utils/demoMode');
const { diagrams } = require('../utils/mockData');

// @desc    Obter todos os diagramas (com filtros)
// @route   GET /api/diagrams
// @access  Private + Subscription
exports.getDiagrams = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, retorne os dados simulados
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            count: diagrams.length,
            data: diagrams,
        });
    }

    let query;
    const reqQuery = { ...req.query };

    // Campos para excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Criar query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // Encontrar diagramas
    query = Diagram.find(JSON.parse(queryStr)).populate('vehicle', 'model brand year');

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Diagram.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executar query
    const diagrams = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        };
    }

    res.status(200).json({
        success: true,
        count: diagrams.length,
        pagination,
        data: diagrams,
    });
});

// @desc    Obter um diagrama específico
// @route   GET /api/diagrams/:id
// @access  Private + Subscription
exports.getDiagram = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, retorne os dados simulados
    if (DEMO_MODE.enabled) {
        const diagram = diagrams.find(d => d._id === req.params.id);

        if (!diagram) {
            return res.status(404).json({
                success: false,
                message: 'Diagrama não encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            data: diagram,
        });
    }

    const diagram = await Diagram.findById(req.params.id).populate('vehicle');

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    res.status(200).json({
        success: true,
        data: diagram,
    });
});

// @desc    Criar diagrama
// @route   POST /api/diagrams
// @access  Private + Admin
exports.createDiagram = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule criação
    if (DEMO_MODE.enabled) {
        return res.status(201).json({
            success: true,
            message: 'Diagrama criado com sucesso (modo demo)',
            data: {
                _id: 'demo-diagram-id',
                title: req.body.title,
                ...req.body
            },
        });
    }

    // Adicionar usuário ao corpo da requisição
    req.body.user = req.user.id;

    // Criar diagrama
    const diagram = await Diagram.create(req.body);

    res.status(201).json({
        success: true,
        data: diagram,
    });
});

// @desc    Atualizar diagrama
// @route   PUT /api/diagrams/:id
// @access  Private + Admin
exports.updateDiagram = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule atualização
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Diagrama atualizado com sucesso (modo demo)',
            data: {
                _id: req.params.id,
                ...req.body
            },
        });
    }

    let diagram = await Diagram.findById(req.params.id);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    // Atualizar diagrama
    diagram = await Diagram.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: diagram,
    });
});

// @desc    Excluir diagrama
// @route   DELETE /api/diagrams/:id
// @access  Private + Admin
exports.deleteDiagram = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule exclusão
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Diagrama excluído com sucesso (modo demo)',
            data: {},
        });
    }

    const diagram = await Diagram.findById(req.params.id);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    // Remover arquivos do Cloudinary se existirem
    if (diagram.fileId) {
        await cloudinary.uploader.destroy(diagram.fileId);
    }

    await diagram.deleteOne(); // Corrigido: .remove() está obsoleto

    res.status(200).json({
        success: true,
        data: {},
    });
});

// @desc    Upload de arquivo para diagrama
// @route   POST /api/diagrams/:id/upload
// @access  Private + Admin
exports.uploadDiagramFile = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule upload
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Arquivo enviado com sucesso (modo demo)',
            data: {
                fileUrl: 'https://demo-url/sample-diagram.pdf',
                fileId: 'demo-file-id'
            },
        });
    }

    const diagram = await Diagram.findById(req.params.id);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    if (!req.files) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, envie um arquivo',
        });
    }

    const file = req.files.file;

    // Verificar tipo de arquivo
    if (!file.mimetype.startsWith('application/pdf') &&
        !file.mimetype.startsWith('image')) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, envie um arquivo PDF ou imagem',
        });
    }

    // Verificar tamanho do arquivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, envie um arquivo menor que 10MB',
        });
    }

    try {
        // Upload para Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'diagrams',
            resource_type: 'auto',
        });

        // Remover arquivo anterior do Cloudinary, se existir
        if (diagram.fileId) {
            await cloudinary.uploader.destroy(diagram.fileId);
        }

        // Atualizar diagrama com URL e ID do arquivo
        diagram.fileUrl = result.secure_url;
        diagram.fileId = result.public_id;
        await diagram.save();

        res.status(200).json({
            success: true,
            data: {
                fileUrl: diagram.fileUrl,
                fileId: diagram.fileId,
            },
        });
    } catch (err) {
        console.error('Erro ao fazer upload para o Cloudinary', err);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer upload do arquivo',
        });
    }
});

// @desc    Adicionar diagrama aos favoritos
// @route   POST /api/diagrams/:id/favorite
// @access  Private
exports.addToFavorites = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule adição aos favoritos
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Diagrama adicionado aos favoritos (modo demo)',
        });
    }

    const user = await User.findById(req.user.id);
    const diagramId = req.params.id;

    // Verificar se o diagrama já está nos favoritos
    if (user.favorites.includes(diagramId)) {
        return res.status(400).json({
            success: false,
            message: 'Diagrama já está nos favoritos',
        });
    }

    // Adicionar aos favoritos
    user.favorites.push(diagramId);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Diagrama adicionado aos favoritos',
    });
});

// @desc    Remover diagrama dos favoritos
// @route   DELETE /api/diagrams/:id/favorite
// @access  Private
exports.removeFromFavorites = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule remoção dos favoritos
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Diagrama removido dos favoritos (modo demo)',
        });
    }

    const user = await User.findById(req.user.id);
    const diagramId = req.params.id;

    // Verificar se o diagrama está nos favoritos
    if (!user.favorites.includes(diagramId)) {
        return res.status(400).json({
            success: false,
            message: 'Diagrama não está nos favoritos',
        });
    }

    // Remover dos favoritos
    user.favorites = user.favorites.filter(
        (favorite) => favorite.toString() !== diagramId
    );
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Diagrama removido dos favoritos',
    });
});

// @desc    Obter favoritos do usuário
// @route   GET /api/diagrams/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, retorne os dados simulados
    if (DEMO_MODE.enabled) {
        // Filtre os diagramas favoritos do usuário mock
        const user = req.user;
        if (user && user.favorites) {
            const favoriteDiagrams = diagrams.filter(diagram => user.favorites.includes(diagram._id));
            return res.status(200).json({
                success: true,
                count: favoriteDiagrams.length,
                data: favoriteDiagrams,
            });
        } else {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }
    }

    const user = await User.findById(req.user.id);
    const favorites = await Diagram.find({ _id: { $in: user.favorites } }).populate('vehicle');

    res.status(200).json({
        success: true,
        count: favorites.length,
        data: favorites,
    });
});

// @desc    Registrar visualização de diagrama
// @route   POST /api/diagrams/:id/view
// @access  Private + Subscription
exports.recordView = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule registro de visualização
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Visualização registrada (modo demo)',
        });
    }

    const diagram = await Diagram.findById(req.params.id);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    // Incrementar contagem de visualizações
    diagram.views = (diagram.views || 0) + 1;
    await diagram.save();

    res.status(200).json({
        success: true,
        message: 'Visualização registrada',
    });
});

// @desc    Registrar download de diagrama
// @route   POST /api/diagrams/:id/download
// @access  Private + Subscription
exports.recordDownload = asyncHandler(async (req, res) => {
    // Se estiver em modo de demonstração, simule registro de download
    if (DEMO_MODE.enabled) {
        return res.status(200).json({
            success: true,
            message: 'Download registrado (modo demo)',
        });
    }

    const diagram = await Diagram.findById(req.params.id);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    // Incrementar contagem de downloads
    diagram.downloads = (diagram.downloads || 0) + 1;
    await diagram.save();

    res.status(200).json({
        success: true,
        message: 'Download registrado',
    });
});