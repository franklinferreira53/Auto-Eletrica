const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Como não temos o controlador de usuário, vamos criar um esqueleto básico
// Normalmente, importaríamos as funções do controlador:
// const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');

// Rota temporária para teste
router.get('/', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Esta rota retornará a lista de usuários',
        data: []
    });
});

router.get('/:id', protect, (req, res) => {
    res.json({
        success: true,
        message: `Esta rota retornará o usuário com id ${req.params.id}`,
        data: null
    });
});

router.put('/:id', protect, (req, res) => {
    res.json({
        success: true,
        message: `Esta rota atualizará o usuário com id ${req.params.id}`,
        data: null
    });
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: `Esta rota excluirá o usuário com id ${req.params.id}`,
        data: null
    });
});

module.exports = router;
