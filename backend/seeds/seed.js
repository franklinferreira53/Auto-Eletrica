const mongoose = require('mongoose');
const User = require('../models/User');
const Brand = require('../models/Brand');
const Subscription = require('../models/Subscription');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: '../.env' });

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

// Dados iniciais

// Usuário admin
const adminUser = {
  name: 'Administrador',
  email: 'admin@admin.com',
  password: 'admin',
  role: 'admin',
  emailVerified: true,
  active: true,
};

// Marcas populares
const popularBrands = [
  {
    name: 'Volkswagen',
    country: 'Alemanha',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/volkswagen.png',
  },
  {
    name: 'Chevrolet',
    country: 'Estados Unidos',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/chevrolet.png',
  },
  {
    name: 'Fiat',
    country: 'Itália',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/fiat.png',
  },
  {
    name: 'Ford',
    country: 'Estados Unidos',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/ford.png',
  },
  {
    name: 'Toyota',
    country: 'Japão',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/toyota.png',
  },
  {
    name: 'Honda',
    country: 'Japão',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/honda.png',
  },
  {
    name: 'Hyundai',
    country: 'Coréia do Sul',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/hyundai.png',
  },
  {
    name: 'Renault',
    country: 'França',
    logo: 'https://res.cloudinary.com/autoeletrica/image/upload/v1/auto-eletrica/brands/renault.png',
  },
];

// Planos de assinatura
const subscriptionPlans = [
  {
    name: 'Básico',
    description: 'Acesso a diagramas básicos de rastreamento.',
    features: [
      'Acesso a diagramas de rastreamento',
      '5 diagramas por dia',
      'Suporte por email',
    ],
    price: {
      monthly: 29.90,
      quarterly: 79.90,
      semiannual: 149.90,
      annual: 279.90,
    },
    duration: 30, // 30 dias para plano mensal
    maxDiagrams: 150, // 5 por dia
    accessLevel: {
      tracking: true,
      electrical: false,
      premium: false,
    },
    downloadAllowed: false,
    active: true,
    displayOrder: 1,
  },
  {
    name: 'Profissional',
    description: 'Acesso completo a diagramas de rastreamento e auto-elétrica.',
    features: [
      'Acesso a todos os diagramas',
      'Diagramas ilimitados',
      'Download de diagramas',
      'Suporte prioritário',
    ],
    price: {
      monthly: 49.90,
      quarterly: 139.90,
      semiannual: 269.90,
      annual: 499.90,
    },
    duration: 30, // 30 dias para plano mensal
    maxDiagrams: -1, // ilimitado
    accessLevel: {
      tracking: true,
      electrical: true,
      premium: true,
    },
    downloadAllowed: true,
    active: true,
    displayOrder: 2,
  },
  {
    name: 'Empresarial',
    description: 'Ideal para empresas com vários instaladores.',
    features: [
      'Tudo do plano Profissional',
      'Múltiplos usuários (até 5)',
      'Suporte 24/7',
      'Treinamento personalizado',
    ],
    price: {
      monthly: 199.90,
      quarterly: 549.90,
      semiannual: 1099.90,
      annual: 1999.90,
    },
    duration: 30, // 30 dias para plano mensal
    maxDiagrams: -1, // ilimitado
    accessLevel: {
      tracking: true,
      electrical: true,
      premium: true,
    },
    downloadAllowed: true,
    active: true,
    displayOrder: 3,
  },
];

// Função para semear o banco de dados
const seedDatabase = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();

    // Limpar coleções existentes
    console.log('Limpando coleções existentes...');
    await User.deleteMany({ email: adminUser.email });
    await Brand.deleteMany({});
    await Subscription.deleteMany({});

    // Criar usuário administrador
    console.log('Criando usuário administrador...');
    await User.create(adminUser);

    // Criar marcas
    console.log('Criando marcas...');
    await Brand.insertMany(popularBrands);

    // Criar planos de assinatura
    console.log('Criando planos de assinatura...');
    await Subscription.insertMany(subscriptionPlans);

    console.log('Dados iniciais inseridos com sucesso!');
    console.log('\nUsuário administrador criado:');
    console.log('Email: admin@admin.com');
    console.log('Senha: admin');
    
    process.exit();
  } catch (err) {
    console.error('Erro ao semear o banco de dados:', err);
    process.exit(1);
  }
};

// Executar a função de seed
seedDatabase();