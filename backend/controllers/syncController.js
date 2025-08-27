const Diagram = require('../models/Diagram');
const asyncHandler = require('../middleware/asyncHandler');
const { DEMO_MODE } = require('../utils/demoMode');
const { diagrams } = require('../utils/mockData');

// @desc    Sincronizar diagramas atualizados após determinada data
// @route   GET /api/diagrams/sync
// @access  Private
exports.syncDiagrams = asyncHandler(async (req, res) => {
    // Obter timestamp da última sincronização
    const lastSync = req.query.lastSync ? new Date(parseInt(req.query.lastSync)) : new Date(0);

    // Se estiver em modo de demonstração, retorne dados simulados de sincronização
    if (DEMO_MODE.enabled) {
        // Simular alguns diagramas atualizados
        const mockUpdates = diagrams
            .filter(d => Math.random() > 0.7) // Aleatoriamente selecionar alguns diagramas
            .slice(0, 3) // Limitar a 3 diagramas
            .map(d => ({
                ...d,
                updatedAt: new Date().toISOString()
            }));

        return res.status(200).json({
            success: true,
            message: 'Sincronização concluída (modo demo)',
            timestamp: Date.now(),
            count: mockUpdates.length,
            data: mockUpdates,
        });
    }

    // Buscar diagramas criados ou atualizados após a data da última sincronização
    const updatedDiagrams = await Diagram.find({
        $or: [
            { createdAt: { $gt: lastSync } },
            { updatedAt: { $gt: lastSync } }
        ]
    }).populate('vehicle', 'model brand year');

    res.status(200).json({
        success: true,
        timestamp: Date.now(),
        count: updatedDiagrams.length,
        data: updatedDiagrams
    });
});
