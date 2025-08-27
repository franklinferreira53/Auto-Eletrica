const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, company, profileType, acceptedTrial } = req.body;

  // Verificar se o modo de demonstração está ativado
  const { DEMO_MODE, demoRegister } = require('../utils/demoMode');
  if (DEMO_MODE.enabled) {
    console.log('Usando registro em modo de demonstração');

    // Verificar se o email já está em uso nos dados mockados
    const mockData = require('../utils/mockDataEnhanced');
    const userExists = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso',
      });
    }

    // Usar registro em modo de demonstração
    const result = await demoRegister({
      name,
      email,
      password,
      phone,
      company,
      profileType,
      trialStart: acceptedTrial ? new Date() : null,
      trialEnd: acceptedTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 dias
    });

    // Retornar resposta com token e dados do usuário
    return res.status(201).json({
      success: true,
      message: 'Registro realizado com sucesso (modo de demonstração)',
      token: result.token,
      user: result.user
    });
  }

  // Modo normal - verificar se o usuário já existe no banco de dados
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Email já está em uso',
    });
  }

  // Gerar token de verificação
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Criar usuário
  const user = await User.create({
    name,
    email,
    password,
    phone,
    company,
    profileType: profileType || 'installer',
    verificationToken,
    trialStart: acceptedTrial ? Date.now() : null,
    trialEnd: acceptedTrial ? Date.now() + 7 * 24 * 60 * 60 * 1000 : null, // 7 dias
  });

  // Enviar email de verificação
  try {
    const verifyUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/verify-email/${verificationToken}`;

    const message = `Você está recebendo este email porque você precisa verificar sua conta. Por favor, clique no link abaixo para verificar seu email:\n\n${verifyUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Verificação de Email',
      message,
    });
  } catch (err) {
    console.error('Erro ao enviar email de verificação', err);
    user.verificationToken = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email não pode ser enviado',
    });
  }

  // Criar token JWT
  sendTokenResponse(user, 201, res, 'Registro realizado com sucesso. Por favor, verifique seu email.');
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar email e senha
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça email e senha',
    });
  }

  // Verificar se o modo de demonstração está ativado
  const { DEMO_MODE, demoLogin } = require('../utils/demoMode');
  if (DEMO_MODE.enabled) {
    console.log('Usando login em modo de demonstração');

    // Usar login em modo de demonstração
    const result = await demoLogin(email, password);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message
      });
    }

    // Retornar resposta de sucesso com token e dados do usuário
    return res.status(200).json({
      success: true,
      message: 'Login bem-sucedido (modo de demonstração)',
      token: result.token,
      user: result.user
    });
  }

  // Modo normal - verifica o usuário no banco de dados
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
    });
  }

  // Verificar se a senha corresponde
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
    });
  }

  // Verificar se o email foi verificado
  if (!user.emailVerified) {
    return res.status(401).json({
      success: false,
      message: 'Por favor, verifique seu email antes de fazer login',
    });
  }

  // Verificar se o usuário está ativo
  if (!user.active) {
    return res.status(401).json({
      success: false,
      message: 'Sua conta está desativada. Entre em contato com o suporte.',
    });
  }

  // Atualizar último login
  user.lastLogin = Date.now();
  await user.save();

  // Criar token JWT
  sendTokenResponse(user, 200, res);
});

// @desc    Sair da conta (logout)
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  // Se estiver em modo de demonstração, retornar diretamente o usuário do req
  const { DEMO_MODE } = require('../utils/demoMode');

  if (DEMO_MODE.enabled) {
    // O usuário já foi definido no middleware protect
    // E já removemos a senha no método getUserById
    const subscriptionStatus = 'active'; // No modo demo, assinatura sempre ativa

    return res.status(200).json({
      success: true,
      data: {
        ...req.user,
        subscriptionStatus,
      },
    });
  }

  // Modo normal - buscar do banco de dados
  const user = await User.findById(req.user.id).populate('subscription');

  // Verificar status da assinatura
  const subscriptionStatus = user.hasActiveSubscription()
    ? 'active'
    : 'inactive';

  res.status(200).json({
    success: true,
    data: {
      ...user._doc,
      subscriptionStatus,
    },
  });
});

// @desc    Atualizar senha
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validar senhas
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça senha atual e nova senha',
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  // Verificar senha atual
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Senha atual incorreta',
    });
  }

  // Definir nova senha
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Senha atualizada com sucesso');
});

// @desc    Esqueci a senha
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Não existe usuário com esse email',
    });
  }

  // Gerar token de redefinição
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash do token e definir campo resetPasswordToken
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Definir expiração (10 minutos)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Enviar email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/reset-password/${resetToken}`;

    const message = `Você está recebendo este email porque você (ou outra pessoa) solicitou a redefinição de senha. Por favor, clique no link abaixo para redefinir sua senha:\n\n${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Redefinição de Senha',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email enviado',
    });
  } catch (err) {
    console.error('Erro ao enviar email de redefinição de senha', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email não pode ser enviado',
    });
  }
});

// @desc    Redefinir senha
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  // Obter token hashed
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // Encontrar usuário pelo token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }

  // Definir nova senha
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res, 'Senha redefinida com sucesso');
});

// @desc    Verificar email
// @route   GET /api/auth/verify-email/:verificationToken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  // Encontrar usuário pelo token de verificação
  const user = await User.findOne({
    verificationToken: req.params.verificationToken,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token de verificação inválido',
    });
  }

  // Atualizar status de verificação
  user.emailVerified = true;
  user.verificationToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verificado com sucesso. Agora você pode fazer login.',
  });
});

// Função auxiliar para enviar token de resposta
const sendTokenResponse = (user, statusCode, res, message = '') => {
  // Criar token
  const token = user.getSignedJwtToken();

  // Opções para cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Definir cookie seguro em produção
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message: message || 'Autenticação bem-sucedida',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      subscription: user.subscription,
      subscriptionExpiry: user.subscriptionExpiry,
    },
  });
};