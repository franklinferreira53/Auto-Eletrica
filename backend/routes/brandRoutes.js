const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Como não temos o controlador de marcas, vamos criar um esqueleto básico

// Rota para obter todas as marcas
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Esta rota retornará a lista de marcas',
        data: []
    });
});

// Rota para obter uma marca específica
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        message: `Esta rota retornará a marca com id ${req.params.id}`,
        data: null
    });
});

// Rota para criar uma nova marca (somente admin)
router.post('/', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Esta rota criará uma nova marca',
        data: null
    });
});

// Rota para atualizar uma marca (somente admin)
router.put('/:id', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: `Esta rota atualizará a marca com id ${req.params.id}`,
        data: null
    });
});

// Rota para excluir uma marca (somente admin)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: `Esta rota excluirá a marca com id ${req.params.id}`,
        data: null
    });
});

module.exports = router;
