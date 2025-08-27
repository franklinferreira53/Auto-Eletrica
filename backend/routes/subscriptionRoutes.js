const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createSubscription,
    checkSubscriptionStatus,
    listSubscriptionPlans,
    cancelSubscription
} = require('../controllers/subscriptionController');

// Rotas públicas
router.get('/plans', listSubscriptionPlans);

// Rotas protegidas (apenas usuários autenticados)
router.post('/', protect, createSubscription);
router.get('/:id', protect, checkSubscriptionStatus);
router.delete('/:id', protect, cancelSubscription);

// Rotas administrativas (apenas admin)
router.get('/', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Lista de todas as assinaturas',
        data: []
    });
});

// Rota para atualizar uma assinatura
router.put('/:id', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: `Esta rota atualizará a assinatura com id ${req.params.id}`,
        data: null
    });
});

module.exports = router;
