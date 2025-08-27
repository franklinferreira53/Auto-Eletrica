const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Usar os dados mock aprimorados
const mockData = require('./mockDataEnhanced');

// Modo de demonstração - valores fixos para teste
const DEMO_MODE = {
    enabled: false, // Isso será alterado para true se o banco de dados não estiver disponível
    adminUser: {
        id: '60d0fe4f5311236168a109ca',
        name: 'Administrador',
        email: 'admin@admin.com',
        role: 'admin'
    }
};

// Função para verificar se estamos no modo demonstração
const isDemoMode = () => DEMO_MODE.enabled;

// Função para gerar token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'demo-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Função para login sem banco de dados (modo demo)
const demoLogin = async (email, password) => {
    console.log(`Tentativa de login no modo demo: ${email} / ${password}`);

    // Verifica credenciais nos dados mockados
    const user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.log('Usuário não encontrado no modo demo');
        return { success: false, statusCode: 401, message: 'Credenciais inválidas' };
    }

    // Para modo de demonstração, a senha 'admin' funciona para todos os usuários
    // Ou usando a primeira parte do email como senha
    const emailPrefix = email.split('@')[0];
    if (password === 'admin' || password === emailPrefix) {
        console.log(`Login bem-sucedido no modo demo para: ${email}`);

        // Registrar o login
        user.lastLogin = new Date();

        return {
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileType: user.profileType || 'installer',
                subscription: user.subscription,
                subscriptionExpiry: user.subscriptionExpiry,
                trialStart: user.trialStart,
                trialEnd: user.trialEnd
            }
        };
    }

    console.log('Senha incorreta no modo demo');
    return { success: false, statusCode: 401, message: 'Credenciais inválidas' };
};

// Função para obter usuário pelo ID
const getUserById = (id) => {
    const user = mockData.users.find(u => u._id === id);
    if (!user) return null;

    // Não retornar a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Função para registrar um novo usuário no modo demo
const demoRegister = async (userData) => {
    // Gerar um ID único
    const lastUserId = mockData.users[mockData.users.length - 1]._id;
    const newId = incrementId(lastUserId);

    // Criar novo usuário
    const newUser = {
        _id: newId,
        name: userData.name,
        email: userData.email,
        password: '$2a$10$n7CuBr.9WrMhT4UCooXD7.SwNCxAkYT85bFLmQvrJ.VtGZVKt2z.W', // hash para 'admin'
        role: 'user',
        active: true,
        emailVerified: true,
        profileType: userData.profileType || 'installer',
        company: userData.company || '',
        phone: userData.phone || '',
        createdAt: new Date(),
        subscription: '60d0fe4f5311236168a109cc', // Assinatura básica
        subscriptionExpiry: null,
        favorites: [],
        trialStart: userData.trialStart || new Date(),
        trialEnd: userData.trialEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    };

    // Adicionar à lista de usuários mockados
    mockData.users.push(newUser);

    return {
        success: true,
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profileType: newUser.profileType,
            trialStart: newUser.trialStart,
            trialEnd: newUser.trialEnd
        },
        token: generateToken(newUser._id)
    };
};

// Função auxiliar para incrementar IDs
const incrementId = (id) => {
    // Assumindo que o ID termina com um formato hexadecimal
    const lastChar = id.charAt(id.length - 1);
    const lastDigit = parseInt(lastChar, 16);
    const newLastDigit = (lastDigit + 1) % 16;
    return id.slice(0, -1) + newLastDigit.toString(16);
};

module.exports = {
    DEMO_MODE,
    demoLogin,
    getUserById,
    demoRegister,
    isDemoMode,
    generateToken
};
