const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const { DEMO_MODE, getUserById } = require('../utils/demoMode');

// Middleware de proteção de rotas
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificar se o token existe no header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Formato: Bearer token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Verificar cookies
    token = req.cookies.token;
  }

  // Verificar se o token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado, nenhum token fornecido',
    });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se estiver em modo de demonstração, use os dados simulados
    if (DEMO_MODE.enabled) {
      req.user = getUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado',
        });
      }
    } else {
      // Modo normal - buscar do banco de dados
      req.user = await User.findById(decoded.id);

      // Verificar se o usuário existe
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado',
        });
      }

      // Verificar se o usuário está ativo
      if (!req.user.active) {
        return res.status(401).json({
          success: false,
          message: 'Sua conta está desativada. Entre em contato com o suporte.',
        });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }
});

// Middleware para verificar papéis
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Papel ${req.user.role} não tem permissão para acessar esta rota`,
      });
    }

    next();
  };
};

// Middleware para verificar assinatura ativa
exports.checkSubscription = asyncHandler(async (req, res, next) => {
  // Admins podem acessar tudo
  if (req.user.role === 'admin') {
    return next();
  }

  // Verificar se o usuário tem uma assinatura ativa
  if (!req.user.subscription || !req.user.subscriptionExpiry || new Date(req.user.subscriptionExpiry) < new Date()) {
    return res.status(403).json({
      success: false,
      message: 'Assinatura expirada ou inválida. Por favor, atualize sua assinatura.',
    });
  }

  next();
});