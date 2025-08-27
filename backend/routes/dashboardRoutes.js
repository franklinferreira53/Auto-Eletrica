const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Como não temos o controlador de dashboard, vamos criar um esqueleto básico

// Rota para obter estatísticas do dashboard para administrador
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Esta rota retornará as estatísticas do dashboard para administradores',
        data: {
            totalUsers: 0,
            totalSubscriptions: 0,
            totalVehicles: 0,
            totalDiagrams: 0,
            recentUsers: [],
            recentSubscriptions: []
        }
    });
});

// Rota para obter estatísticas do dashboard para usuário normal
router.get('/user', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Esta rota retornará as estatísticas do dashboard para usuários',
        data: {
            subscription: null,
            recentViews: [],
            favorites: [],
            diagrams: {
                total: 0,
                tracking: 0,
                electrical: 0
            }
        }
    });
});

module.exports = router;
