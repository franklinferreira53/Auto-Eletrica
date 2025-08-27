// Função para criar usuário mock
const createMockUser = (id, name, email, role = 'user', options = {}) => {
    const now = new Date();
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);

    return {
        _id: id,
        name: name,
        email: email,
        password: '$2a$10$n7CuBr.9WrMhT4UCooXD7.SwNCxAkYT85bFLmQvrJ.VtGZVKt2z.W', // hash para 'admin'
        role: role,
        active: options.active !== undefined ? options.active : true,
        emailVerified: options.emailVerified !== undefined ? options.emailVerified : true,
        createdAt: options.createdAt || now,
        subscription: options.subscription || '60d0fe4f5311236168a109cb',
        subscriptionExpiry: options.subscriptionExpiry || subscriptionExpiry,
        favorites: options.favorites || [],
        profileType: options.profileType || (Math.random() > 0.5 ? 'electrician' : 'installer'),
        company: options.company || '',
        phone: options.phone || '',
        lastLogin: options.lastLogin || now,
        trialStart: options.trialStart || null,
        trialEnd: options.trialEnd || null
    };
};

// Função para criar marca mock
const createMockBrand = (id, name, country = 'Brasil', vehicleCount = 0) => {
    return {
        _id: id,
        name: name,
        logo: `${name.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
        createdAt: new Date('2025-01-01'),
        country: country,
        vehicleCount: vehicleCount
    };
};

// Função para criar veículo mock
const createMockVehicle = (id, model, brand, year, engineType = 'gasoline', options = {}) => {
    return {
        _id: id,
        model: model,
        brand: brand,
        year: year,
        engineType: engineType,
        transmissionType: options.transmissionType || 'manual',
        category: options.category || 'sedan',
        image: `${model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        createdAt: options.createdAt || new Date('2025-01-01'),
        diagrams: options.diagrams || []
    };
};

// Mais usuários realistas
const mockUsers = [
    createMockUser('60d0fe4f5311236168a109ca', 'Administrador', 'admin@admin.com', 'admin'),
    createMockUser('60d0fe4f5311236168a109cd', 'José da Silva', 'jose@autoeletricasilva.com.br', 'user', {
        profileType: 'electrician',
        company: 'Auto Elétrica Silva',
        phone: '(11) 99999-8888'
    }),
    createMockUser('60d0fe4f5311236168a109ce', 'Maria Oliveira', 'maria@rastreiototal.com.br', 'user', {
        profileType: 'installer',
        company: 'Rastreio Total Ltda',
        phone: '(21) 98765-4321'
    }),
    createMockUser('60d0fe4f5311236168a109cf', 'Roberto Santos', 'roberto@autocentersantos.com', 'user', {
        profileType: 'both',
        company: 'Auto Center Santos',
        phone: '(31) 3232-3232'
    }),
    createMockUser('60d0fe4f5311236168a109d0', 'Antônio Ferreira', 'antonio@gmail.com', 'user', {
        trialStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        trialEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        profileType: 'electrician'
    }),
    createMockUser('60d0fe4f5311236168a109d1', 'Juliana Mendes', 'juliana@instalaseguro.com.br', 'user', {
        profileType: 'installer',
        company: 'Instala Seguro',
        subscriptionExpiry: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        active: false
    }),
    createMockUser('60d0fe4f5311236168a109d2', 'Pedro Alcântara', 'pedro@eletricauto.net', 'user', {
        profileType: 'both',
        company: 'Eletric Auto',
        favorites: ['60d0fe4f5311236168a109d3', '60d0fe4f5311236168a109d4']
    })
];

// Marcas realistas (top marcas no Brasil)
const mockBrands = [
    createMockBrand('60d0fe4f5311236168a109d0', 'Volkswagen', 'Alemanha', 15),
    createMockBrand('60d0fe4f5311236168a109d1', 'Chevrolet', 'Estados Unidos', 17),
    createMockBrand('60d0fe4f5311236168a109d2', 'Fiat', 'Itália', 14),
    createMockBrand('60d0fe4f5311236168a109d3', 'Ford', 'Estados Unidos', 10),
    createMockBrand('60d0fe4f5311236168a109d4', 'Toyota', 'Japão', 8),
    createMockBrand('60d0fe4f5311236168a109d5', 'Honda', 'Japão', 6),
    createMockBrand('60d0fe4f5311236168a109d6', 'Hyundai', 'Coreia do Sul', 9),
    createMockBrand('60d0fe4f5311236168a109d7', 'John Deere', 'Estados Unidos', 7),
    createMockBrand('60d0fe4f5311236168a109d8', 'Tesla', 'Estados Unidos', 4),
    createMockBrand('60d0fe4f5311236168a109d9', 'Randon', 'Brasil', 5),
    createMockBrand('60d0fe4f5311236168a109d7', 'Renault', 'França', 12),
    createMockBrand('60d0fe4f5311236168a109d8', 'Mitsubishi', 'Japão', 5),
    createMockBrand('60d0fe4f5311236168a109d9', 'Nissan', 'Japão', 7),
    createMockBrand('60d0fe4f5311236168a109e0', 'Jeep', 'Estados Unidos', 6),
    createMockBrand('60d0fe4f5311236168a109e1', 'Peugeot', 'França', 8),
    createMockBrand('60d0fe4f5311236168a109e2', 'Citroën', 'França', 7),
    createMockBrand('60d0fe4f5311236168a109e3', 'BMW', 'Alemanha', 5),
    createMockBrand('60d0fe4f5311236168a109e4', 'Mercedes-Benz', 'Alemanha', 5),
    createMockBrand('60d0fe4f5311236168a109e5', 'Audi', 'Alemanha', 4),
    createMockBrand('60d0fe4f5311236168a109e6', 'Kia', 'Coreia do Sul', 6),
    createMockBrand('60d0fe4f5311236168a109e7', 'Suzuki', 'Japão', 3),
    createMockBrand('60d0fe4f5311236168a109e8', 'Land Rover', 'Reino Unido', 2),
    createMockBrand('60d0fe4f5311236168a109e9', 'Volvo', 'Suécia', 3)
];

// Veículos populares
const mockVehicles = [
    // Volkswagen
    createMockVehicle('60d0fe4f5311236168a109f0', 'Gol', '60d0fe4f5311236168a109d0', '2020-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109f1', 'Polo', '60d0fe4f5311236168a109d0', '2021-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109f2', 'T-Cross', '60d0fe4f5311236168a109d0', '2022-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a150a0', 'ID.4', '60d0fe4f5311236168a109d0', '2022-2025', 'electric', { category: 'suv' }),

    // Chevrolet
    createMockVehicle('60d0fe4f5311236168a109f3', 'Onix', '60d0fe4f5311236168a109d1', '2020-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109f4', 'Tracker', '60d0fe4f5311236168a109d1', '2021-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109f5', 'S10', '60d0fe4f5311236168a109d1', '2020-2023', 'diesel', { category: 'pickup' }),
    createMockVehicle('60d0fe4f5311236168a150a1', 'Bolt EV', '60d0fe4f5311236168a109d1', '2022-2025', 'electric', { category: 'hatchback' }),

    // Fiat
    createMockVehicle('60d0fe4f5311236168a109f6', 'Argo', '60d0fe4f5311236168a109d2', '2021-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109f7', 'Toro', '60d0fe4f5311236168a109d2', '2022-2023', 'flex', { category: 'pickup' }),
    createMockVehicle('60d0fe4f5311236168a109f8', 'Strada', '60d0fe4f5311236168a109d2', '2021-2023', 'flex', { category: 'pickup' }),
    createMockVehicle('60d0fe4f5311236168a150a2', 'Ducato', '60d0fe4f5311236168a109d2', '2021-2024', 'diesel', { category: 'van' }),

    // Ford
    createMockVehicle('60d0fe4f5311236168a109f9', 'Ranger', '60d0fe4f5311236168a109d3', '2021-2023', 'diesel', { category: 'pickup' }),
    createMockVehicle('60d0fe4f5311236168a109fa', 'Bronco', '60d0fe4f5311236168a109d3', '2022-2023', 'flex', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a109fb', 'Territory', '60d0fe4f5311236168a109d3', '2021-2023', 'flex', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a150a3', 'Mustang Mach-E', '60d0fe4f5311236168a109d3', '2022-2025', 'electric', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a150a4', 'Transit', '60d0fe4f5311236168a109d3', '2020-2023', 'diesel', { category: 'van' }),
    createMockVehicle('60d0fe4f5311236168a150a5', 'F-4000', '60d0fe4f5311236168a109d3', '2021-2023', 'diesel', { category: 'truck' }),

    // Toyota
    createMockVehicle('60d0fe4f5311236168a109fc', 'Corolla', '60d0fe4f5311236168a109d4', '2020-2023', 'flex', { transmissionType: 'automatic' }),
    createMockVehicle('60d0fe4f5311236168a109fd', 'Hilux', '60d0fe4f5311236168a109d4', '2021-2023', 'diesel', { category: 'pickup' }),
    createMockVehicle('60d0fe4f5311236168a109fe', 'SW4', '60d0fe4f5311236168a109d4', '2022-2023', 'diesel', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a150a6', 'Corolla Hybrid', '60d0fe4f5311236168a109d4', '2022-2025', 'hybrid', { category: 'sedan', transmissionType: 'cvt' }),

    // Honda
    createMockVehicle('60d0fe4f5311236168a109ff', 'Civic', '60d0fe4f5311236168a109d5', '2022-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a110a0', 'HR-V', '60d0fe4f5311236168a109d5', '2020-2023', 'flex', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a110a1', 'City', '60d0fe4f5311236168a109d5', '2021-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a109e1', 'CG 160', '60d0fe4f5311236168a109d5', '2022-2025', 'gasoline', { category: 'motorcycle' }),
    createMockVehicle('60d0fe4f5311236168a150a7', 'CB 500F', '60d0fe4f5311236168a109d5', '2021-2024', 'gasoline', { category: 'motorcycle' }),
    createMockVehicle('60d0fe4f5311236168a150a8', 'CB 1000R', '60d0fe4f5311236168a109d5', '2020-2023', 'gasoline', { category: 'motorcycle' }),

    // Veículos de outros tipos

    // John Deere (Tratores)
    createMockVehicle('60d0fe4f5311236168a109e3', '6145J', '60d0fe4f5311236168a109d7', '2021-2025', 'diesel', { category: 'tractor' }),
    createMockVehicle('60d0fe4f5311236168a150b0', '6110J', '60d0fe4f5311236168a109d7', '2020-2024', 'diesel', { category: 'tractor' }),
    createMockVehicle('60d0fe4f5311236168a150b1', '5075E', '60d0fe4f5311236168a109d7', '2022-2025', 'diesel', { category: 'tractor' }),
    createMockVehicle('60d0fe4f5311236168a150b2', '7230J', '60d0fe4f5311236168a109d7', '2021-2023', 'diesel', { category: 'tractor' }),

    // Tesla (Carros Elétricos)
    createMockVehicle('60d0fe4f5311236168a109e4', 'Model 3', '60d0fe4f5311236168a109d8', '2022-2025', 'electric', { category: 'sedan' }),
    createMockVehicle('60d0fe4f5311236168a150b3', 'Model S', '60d0fe4f5311236168a109d8', '2020-2023', 'electric', { category: 'sedan' }),
    createMockVehicle('60d0fe4f5311236168a150b4', 'Model X', '60d0fe4f5311236168a109d8', '2021-2024', 'electric', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a150b5', 'Model Y', '60d0fe4f5311236168a109d8', '2022-2025', 'electric', { category: 'suv' }),

    // Volkswagen (Caminhões)
    createMockVehicle('60d0fe4f5311236168a109e2', 'Constellation 24.280', '60d0fe4f5311236168a109d0', '2020-2024', 'diesel', { category: 'truck' }),
    createMockVehicle('60d0fe4f5311236168a150b6', 'Delivery 9.170', '60d0fe4f5311236168a109d0', '2021-2023', 'diesel', { category: 'truck' }),
    createMockVehicle('60d0fe4f5311236168a150b7', 'Constellation 17.280', '60d0fe4f5311236168a109d0', '2022-2025', 'diesel', { category: 'truck' }),

    // Mercedes-Benz (Caminhões e Ônibus)
    createMockVehicle('60d0fe4f5311236168a150b8', 'Accelo 815', '60d0fe4f5311236168a109e4', '2020-2023', 'diesel', { category: 'truck' }),
    createMockVehicle('60d0fe4f5311236168a150b9', 'Actros 2651', '60d0fe4f5311236168a109e4', '2021-2024', 'diesel', { category: 'truck' }),
    createMockVehicle('60d0fe4f5311236168a150c0', 'O-500 RS', '60d0fe4f5311236168a109e4', '2022-2025', 'diesel', { category: 'bus' }),

    // Scania (Caminhões)
    createMockVehicle('60d0fe4f5311236168a150c1', 'R 450', '60d0fe4f5311236168a109e9', '2021-2025', 'diesel', { category: 'truck' }),
    createMockVehicle('60d0fe4f5311236168a150c2', 'G 410', '60d0fe4f5311236168a109e9', '2020-2023', 'diesel', { category: 'truck' }),

    // Randon (Implementos)
    createMockVehicle('60d0fe4f5311236168a109e5', 'Carreta Graneleira', '60d0fe4f5311236168a109d9', '2022-2025', null, { category: 'trailer' }),
    createMockVehicle('60d0fe4f5311236168a150c3', 'Carreta Basculante', '60d0fe4f5311236168a109d9', '2021-2024', null, { category: 'trailer' }),
    createMockVehicle('60d0fe4f5311236168a150c4', 'Semi Reboque Sider', '60d0fe4f5311236168a109d9', '2020-2023', null, { category: 'trailer' }),

    // Yamaha (Motos)
    createMockVehicle('60d0fe4f5311236168a150c5', 'YBR 150', '60d0fe4f5311236168a109e7', '2022-2025', 'gasoline', { category: 'motorcycle' }),
    createMockVehicle('60d0fe4f5311236168a150c6', 'Fazer 250', '60d0fe4f5311236168a109e7', '2021-2024', 'gasoline', { category: 'motorcycle' }),
    createMockVehicle('60d0fe4f5311236168a150c7', 'MT-03', '60d0fe4f5311236168a109e7', '2020-2023', 'gasoline', { category: 'motorcycle' }),

    // Hyundai
    createMockVehicle('60d0fe4f5311236168a110a2', 'HB20', '60d0fe4f5311236168a109d6', '2020-2023', 'flex'),
    createMockVehicle('60d0fe4f5311236168a110a3', 'Creta', '60d0fe4f5311236168a109d6', '2022-2023', 'flex', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a110a4', 'Tucson', '60d0fe4f5311236168a109d6', '2020-2022', 'flex', { category: 'suv' }),
    createMockVehicle('60d0fe4f5311236168a150c8', 'IONIQ 5', '60d0fe4f5311236168a109d6', '2022-2025', 'electric', { category: 'suv' })
];

// Exportar todos os dados mockados para uso no sistema
module.exports = {
    users: mockUsers,
    brands: mockBrands,
    vehicles: mockVehicles,
    diagrams: require('./mockDiagrams')  // Usando os diagramas já criados no arquivo anterior
};
