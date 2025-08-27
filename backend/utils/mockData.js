// Dados mock para demonstração quando não há banco de dados disponível
const mockDiagrams = require('./mockDiagrams');

// Usuários
const users = [
    {
        _id: '60d0fe4f5311236168a109ca',
        name: 'Administrador',
        email: 'admin@admin.com',
        password: '$2a$10$n7CuBr.9WrMhT4UCooXD7.SwNCxAkYT85bFLmQvrJ.VtGZVKt2z.W', // hash para 'admin'
        role: 'admin',
        active: true,
        emailVerified: true,
        createdAt: new Date('2025-01-01'),
        subscription: '60d0fe4f5311236168a109cb',
        subscriptionExpiry: new Date('2026-01-01'),
        favorites: []
    },
    {
        _id: '60d0fe4f5311236168a109cd',
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        password: '$2a$10$n7CuBr.9WrMhT4UCooXD7.SwNCxAkYT85bFLmQvrJ.VtGZVKt2z.W', // hash para 'admin'
        role: 'user',
        active: true,
        emailVerified: true,
        createdAt: new Date('2025-02-01'),
        subscription: '60d0fe4f5311236168a109cc',
        subscriptionExpiry: new Date('2025-12-31'),
        favorites: ['60d0fe4f5311236168a109d3']
    }
];

// Marcas
const brands = [
    {
        _id: '60d0fe4f5311236168a109d0',
        name: 'Toyota',
        logo: 'toyota-logo.png',
        createdAt: new Date('2025-01-01'),
    },
    {
        _id: '60d0fe4f5311236168a109d1',
        name: 'Honda',
        logo: 'honda-logo.png',
        createdAt: new Date('2025-01-01'),
    },
    {
        _id: '60d0fe4f5311236168a109d2',
        name: 'Ford',
        logo: 'ford-logo.png',
        createdAt: new Date('2025-01-01'),
    }
];

// Veículos
const vehicles = [
    {
        _id: '60d0fe4f5311236168a109d5',
        brand: '60d0fe4f5311236168a109d0', // Toyota
        model: 'Corolla',
        slug: 'toyota-corolla',
        year: '2020-2025',
        yearRange: { start: 2020, end: 2025 },
        version: 'XEI',
        engineType: '2.0',
        engineCapacity: '2000cc',
        fuelType: 'flex',
        transmissionType: 'automatic',
        category: 'car',
        image: 'corolla.jpg',
        createdAt: new Date('2025-01-02')
    },
    {
        _id: '60d0fe4f5311236168a109d6',
        brand: '60d0fe4f5311236168a109d1', // Honda
        model: 'Civic',
        slug: 'honda-civic',
        year: '2019-2024',
        yearRange: { start: 2019, end: 2024 },
        version: 'EXL',
        engineType: '1.5 Turbo',
        engineCapacity: '1500cc',
        fuelType: 'gasoline',
        transmissionType: 'cvt',
        category: 'car',
        image: 'civic.jpg',
        createdAt: new Date('2025-01-03')
    },
    {
        _id: '60d0fe4f5311236168a109d7',
        brand: '60d0fe4f5311236168a109d2', // Ford
        model: 'Ranger',
        slug: 'ford-ranger',
        year: '2020-2025',
        yearRange: { start: 2020, end: 2025 },
        version: 'XLT',
        engineType: '3.2 Diesel',
        engineCapacity: '3200cc',
        fuelType: 'diesel',
        transmissionType: 'automatic',
        category: 'pickup',
        image: 'ranger.jpg',
        createdAt: new Date('2025-01-04'),
        diagrams: ['60d0fe4f5311236168a109d3', '60d0fe4f5311236168a109d4']
    }
];

// Diagramas - Usando os diagramas mockados do arquivo externo
const diagrams = mockDiagrams;

// Assinaturas
const subscriptions = [
    {
        _id: '60d0fe4f5311236168a109cb',
        name: 'Premium',
        description: 'Acesso completo a todos os diagramas',
        price: 99.90,
        duration: 30, // dias
        features: ['Acesso a todos os diagramas', 'Download ilimitado', 'Suporte prioritário'],
        active: true,
        createdAt: new Date('2025-01-01')
    },
    {
        _id: '60d0fe4f5311236168a109cc',
        name: 'Básico',
        description: 'Acesso limitado aos diagramas básicos',
        price: 49.90,
        duration: 30, // dias
        features: ['Acesso a diagramas básicos', 'Download limitado', 'Suporte por email'],
        active: true,
        createdAt: new Date('2025-01-01')
    }
];

// Função para encontrar um objeto por ID
const findById = (collection, id) => {
    return collection.find(item => item._id === id);
};

// Função para filtrar coleções com base em critérios
const find = (collection, filter = {}) => {
    return collection.filter(item => {
        for (const key in filter) {
            if (filter[key] !== item[key]) {
                return false;
            }
        }
        return true;
    });
};

module.exports = {
    users,
    brands,
    vehicles,
    diagrams,
    subscriptions,
    findById,
    find
};
