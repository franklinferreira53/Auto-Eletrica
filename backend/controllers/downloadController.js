const Diagram = require('../models/Diagram');
const asyncHandler = require('../middleware/asyncHandler');
const { DEMO_MODE } = require('../utils/demoMode');
const { diagrams } = require('../utils/mockData');

// @desc    Baixar um diagrama
// @route   GET /api/diagrams/:id/download
// @access  Private + Subscription
exports.downloadDiagram = asyncHandler(async (req, res) => {
    const diagramId = req.params.id;

    // Se estiver em modo de demonstração, simule o download
    if (DEMO_MODE.enabled) {
        const diagram = diagrams.find(d => d._id === diagramId);

        if (!diagram) {
            return res.status(404).json({
                success: false,
                message: 'Diagrama não encontrado',
            });
        }

        // Incrementar contagem de downloads (apenas para simulação)
        diagram.downloads = (diagram.downloads || 0) + 1;

        // Em um cenário real, aqui enviaria o arquivo
        // Como é uma simulação, apenas enviamos uma resposta de sucesso
        return res.status(200).json({
            success: true,
            message: 'Download simulado com sucesso',
            data: diagram
        });
    }

    // Buscar diagrama no banco de dados
    const diagram = await Diagram.findById(diagramId);

    if (!diagram) {
        return res.status(404).json({
            success: false,
            message: 'Diagrama não encontrado',
        });
    }

    // Incrementar contagem de downloads
    diagram.downloads = (diagram.downloads || 0) + 1;
    await diagram.save();

    // Se o diagrama tem um arquivo associado, envie-o
    if (diagram.fileUrl) {
        // Em uma implementação real, aqui redirecionaríamos para o arquivo
        // ou enviaríamos o arquivo como resposta
        return res.status(200).json({
            success: true,
            fileUrl: diagram.fileUrl,
        });
    }

    // Se não há arquivo associado, envie apenas os dados do diagrama
    return res.status(200).json({
        success: true,
        data: diagram,
    });
});

// @desc    Registrar visualização de diagrama
// @route   PUT /api/diagrams/:id/view
// @access  Private
exports.recordView = asyncHandler(async (req, res) => {
    const diagramId = req.params.id;

    // Se estiver em modo de demonstração, simule a visualização
    if (DEMO_MODE.enabled) {
        const diagram = diagrams.find(d => d._id === diagramId);

        if (!diagram) {
            return res.status(404).json({
                success: false,
                message: 'Diagrama não encontrado',
            });
        }

        // Incrementar contagem de visualizações (apenas para simulação)
        diagram.views = (diagram.views || 0) + 1;

        return res.status(200).json({
            success: true,
            message: 'Visualização registrada com sucesso',
            data: diagram
        });
    }

    // Buscar diagrama no banco de dados
    const diagram = await Diagram.findById(diagramId);

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
        data: diagram
    });
});

// @desc    Registrar download de diagrama
// @route   PUT /api/diagrams/:id/download
// @access  Private
exports.recordDownload = asyncHandler(async (req, res) => {
    const diagramId = req.params.id;

    // Se estiver em modo de demonstração, simule o download
    if (DEMO_MODE.enabled) {
        const diagram = diagrams.find(d => d._id === diagramId);

        if (!diagram) {
            return res.status(404).json({
                success: false,
                message: 'Diagrama não encontrado',
            });
        }

        // Incrementar contagem de downloads (apenas para simulação)
        diagram.downloads = (diagram.downloads || 0) + 1;

        return res.status(200).json({
            success: true,
            message: 'Download registrado com sucesso',
            data: diagram
        });
    }

    // Buscar diagrama no banco de dados
    const diagram = await Diagram.findById(diagramId);

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
        data: diagram
    });
});
