// Adicione esse arquivo nos arquivos mockados do backend

// Função para criar um diagrama mock para uso no modo demo
const createMockDiagram = (id, title, vehicle, type, details = {}) => {
    const now = new Date();
    const imageTypes = {
        'tracking': '/images/tracking-diagram.jpg',
        'electrical': '/images/electrical-diagram.jpg',
        'mechanical': '/images/mechanical-diagram.jpg',
        'electronics': '/images/electronics-diagram.jpg',
        'hybrid': '/images/hybrid-diagram.jpg',
        'diagnostic': '/images/diagnostic-diagram.jpg',
        'general': '/images/electrical-diagram.jpg'
    };

    return {
        _id: id,
        title: title,
        slug: title.toLowerCase().replace(/[^\w]+/g, '-'),
        vehicle: vehicle,
        type: type,
        category: details.category || (type === 'tracking' ? 'tracking_installation' : 'electrical_system'),
        description: details.description || `Diagrama completo para ${type === 'tracking' ? 'instalação de rastreador' : 'sistema elétrico'}`,
        fileUrl: details.fileUrl || `diagrams/${id}.pdf`,
        fileType: 'pdf',
        imageUrl: details.imageUrl || imageTypes[type] || '',
        views: Math.floor(Math.random() * 200),
        downloads: Math.floor(Math.random() * 100),
        active: true,
        createdAt: details.createdAt || now,
        updatedAt: details.updatedAt || now,
        user: '60d0fe4f5311236168a109ca',
        tags: details.tags || [],
        premium: details.premium || false
    };
};

// Adicionar diagramas simulados para cada veículo
const mockDiagrams = [];

// Para Toyota Corolla
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a109d3',
        'Diagrama de instalação de rastreador Toyota Corolla',
        '60d0fe4f5311236168a109d5',
        'tracking',
        {
            description: 'Diagrama completo para instalação de rastreador no Toyota Corolla 2020-2025',
            tags: ['toyota', 'corolla', 'rastreador', 'instalação'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/6rhwblm128rfn7j/corolla_tracker_installation.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/i5ghab2edgqkp8a/tracking-diagram-corolla.jpg'
        }
    )
);

mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110d1',
        'Sistema elétrico completo Toyota Corolla',
        '60d0fe4f5311236168a109d5',
        'electrical',
        {
            description: 'Diagrama do sistema elétrico completo do Toyota Corolla 2020-2025',
            tags: ['toyota', 'corolla', 'elétrico', 'completo'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/9vsg7e3hupqwj1q/corolla_electrical_system.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/dcytcxsufvkojy6/electrical-diagram-corolla.jpg'
        }
    )
);

// Para Honda Civic
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a109d4',
        'Diagrama elétrico do Honda Civic',
        '60d0fe4f5311236168a109d6',
        'electrical',
        {
            description: 'Esquema elétrico completo do Honda Civic 2018-2023',
            tags: ['honda', 'civic', 'elétrico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/x7mq2o5dz2wjgpe/civic_electrical_system.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/3rp9bj9wy25ygru/electrical-diagram-civic.jpg'
        }
    )
);

mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110d2',
        'Instalação de rastreador Honda Civic',
        '60d0fe4f5311236168a109d6',
        'tracking',
        {
            description: 'Guia completo para instalação de rastreador no Honda Civic 2018-2023',
            tags: ['honda', 'civic', 'rastreador', 'instalação'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/cyjvwmqa8uv7k0w/civic_tracker_installation.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/xw67cohrmy2hlcg/tracking-diagram-civic.jpg'
        }
    )
);

// Para Ford Ranger
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110d3',
        'Diagrama elétrico central Ford Ranger',
        '60d0fe4f5311236168a109d7',
        'electrical',
        {
            description: 'Esquema da central elétrica da Ford Ranger 2019-2024',
            tags: ['ford', 'ranger', 'central', 'elétrica']
        }
    )
);

mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110d4',
        'Instalação de rastreador Ford Ranger',
        '60d0fe4f5311236168a109d7',
        'tracking',
        {
            description: 'Pontos de instalação de rastreador na Ford Ranger 2019-2024',
            tags: ['ford', 'ranger', 'rastreador', 'instalação']
        }
    )
);

// Moto Honda CG 160
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110e1',
        'Diagrama elétrico Honda CG 160',
        '60d0fe4f5311236168a109e1',
        'electrical',
        {
            description: 'Esquema elétrico completo da Honda CG 160 2022-2025',
            tags: ['honda', 'moto', 'cg160', 'elétrico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/ml47f9t3p8zk5wj/honda_cg160_electrical.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/ybxc4l0k8jdx5m9/electrical-diagram-cg160.jpg',
            category: 'motorcycle_electrical'
        }
    )
);

// Caminhão Volkswagen Constellation
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110e2',
        'Sistema elétrico VW Constellation',
        '60d0fe4f5311236168a109e2',
        'electrical',
        {
            description: 'Diagrama do sistema elétrico do caminhão VW Constellation 2020-2024',
            tags: ['volkswagen', 'caminhão', 'constellation', 'elétrico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/w7j2f8m9u5zqnpx/vw_constellation_electrical.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/d6t0f9r2e3l8qmx/electrical-diagram-vw-truck.jpg',
            category: 'truck_electrical'
        }
    )
);

// Trator John Deere 6145J
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110e3',
        'Diagrama elétrico Trator John Deere 6145J',
        '60d0fe4f5311236168a109e3',
        'electrical',
        {
            description: 'Esquema elétrico completo do trator John Deere 6145J',
            tags: ['john deere', 'trator', '6145j', 'elétrico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/k9p0x2t7v8r9j3n/john_deere_6145j_electrical.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/e5f8h1q9z7r3m6b/electrical-diagram-tractor.jpg',
            category: 'agricultural_electrical'
        }
    )
);

// Carro Elétrico Tesla Model 3
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110e4',
        'Sistema elétrico Tesla Model 3',
        '60d0fe4f5311236168a109e4',
        'electrical',
        {
            description: 'Diagrama do sistema elétrico de alta e baixa tensão do Tesla Model 3',
            tags: ['tesla', 'model 3', 'elétrico', 'veículo elétrico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/p6l8c2x0n4r7v5j/tesla_model3_electrical.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/h9m0v7t3u2e8f1k/electrical-diagram-tesla.jpg',
            category: 'ev_electrical',
            premium: true
        }
    )
);

// Carreta Randon
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a110e5',
        'Sistema elétrico Carreta Randon',
        '60d0fe4f5311236168a109e5',
        'electrical',
        {
            description: 'Esquema elétrico para carreta Randon com sistema ABS',
            tags: ['randon', 'carreta', 'reboque', 'elétrico', 'abs'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/n8x2f7j1p5v9g0m/randon_trailer_electrical.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/z9k8f6l2r4j1q3y/electrical-diagram-trailer.jpg',
            category: 'trailer_electrical'
        }
    )
);

// Mais diagramas simulados para diferentes modelos
for (let i = 1; i <= 8; i++) {
    mockDiagrams.push(
        createMockDiagram(
            `60d0fe4f5311236168a120d${i}`,
            `Diagrama elétrico genérico #${i}`,
            i % 2 === 0 ? '60d0fe4f5311236168a109d5' : '60d0fe4f5311236168a109d6',
            'electrical',
            {
                description: `Diagrama elétrico de exemplo #${i}`,
                tags: ['exemplo', `amostra-${i}`, 'elétrico']
            }
        )
    );

    mockDiagrams.push(
        createMockDiagram(
            `60d0fe4f5311236168a130d${i}`,
            `Instalação de rastreador genérico #${i}`,
            i % 2 === 0 ? '60d0fe4f5311236168a109d6' : '60d0fe4f5311236168a109d7',
            'tracking',
            {
                description: `Diagrama para instalação de rastreador exemplo #${i}`,
                tags: ['exemplo', `amostra-${i}`, 'rastreador']
            }
        )
    );
}

// Adicionar exemplos de diagramas para os novos tipos
// Exemplo de diagrama mecânico
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d1',
        'Diagrama mecânico de suspensão - Toyota Hilux',
        '60d0fe4f5311236168a109d8',
        'mechanical',
        {
            description: 'Esquema detalhado do sistema de suspensão da Toyota Hilux 2020-2023',
            tags: ['toyota', 'hilux', 'suspensão', 'mecânico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/a7b8c9d0e1f2g3h/hilux_suspension.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/h3g4f5j6k7l8m9n/mechanical-diagram-suspension.jpg',
            category: 'suspension'
        }
    )
);

// Exemplo de diagrama eletrônico
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d2',
        'Diagrama de ECU - Volkswagen Golf',
        '60d0fe4f5311236168a109d9',
        'electronics',
        {
            description: 'Esquema detalhado da Unidade de Controle Eletrônico (ECU) do Volkswagen Golf 2019-2022',
            tags: ['volkswagen', 'golf', 'ecu', 'eletrônico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/o9p8q7r6s5t4u3v/golf_ecu.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/w5x6y7z8a9b0c1d/electronics-diagram-ecu.jpg',
            category: 'ecu'
        }
    )
);

// Exemplo de diagrama híbrido
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d3',
        'Sistema Híbrido - Toyota Corolla Hybrid',
        '60d0fe4f5311236168a109e0',
        'hybrid',
        {
            description: 'Esquema completo do sistema híbrido do Toyota Corolla Hybrid 2020-2023',
            tags: ['toyota', 'corolla', 'híbrido', 'bateria'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/e2f3g4h5i6j7k8l/corolla_hybrid.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/m9n0o1p2q3r4s5t/hybrid-diagram-system.jpg',
            category: 'hybrid_system'
        }
    )
);

// Exemplo de diagrama de diagnóstico
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d4',
        'Códigos de diagnóstico - Ford Ranger',
        '60d0fe4f5311236168a109e1',
        'diagnostic',
        {
            description: 'Mapa completo de códigos de diagnóstico OBD2 para Ford Ranger 2018-2022',
            tags: ['ford', 'ranger', 'diagnóstico', 'obd2'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/u6v7w8x9y0z1a2b/ranger_diagnostic.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/c3d4e5f6g7h8i9j/diagnostic-codes-map.jpg',
            category: 'diagnostic_codes'
        }
    )
);

// Exemplo de diagrama mecânico para caminhão
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d5',
        'Sistema de freios - Scania R450',
        '60d0fe4f5311236168a109e2',
        'mechanical',
        {
            description: 'Diagrama detalhado do sistema de freios pneumáticos Scania R450',
            tags: ['scania', 'r450', 'caminhão', 'freio', 'pneumático'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/k1l2m3n4o5p6q7r/scania_brakes.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/s5t6u7v8w9x0y1z/mechanical-diagram-truck-brakes.jpg',
            category: 'brake_system'
        }
    )
);

// Exemplo de diagrama eletrônico para motocicleta
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d6',
        'Sistema de ignição - Honda CB 500',
        '60d0fe4f5311236168a109e3',
        'electronics',
        {
            description: 'Esquema eletrônico do sistema de ignição da Honda CB 500 2019-2022',
            tags: ['honda', 'cb500', 'motocicleta', 'ignição'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/a2b3c4d5e6f7g8h/honda_ignition.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/i9j0k1l2m3n4o5p/electronics-diagram-motorcycle.jpg',
            category: 'ignition'
        }
    )
);

// Exemplo de diagrama para trator agrícola
mockDiagrams.push(
    createMockDiagram(
        '60d0fe4f5311236168a140d7',
        'Sistema hidráulico - John Deere 6110J',
        '60d0fe4f5311236168a109e4',
        'mechanical',
        {
            description: 'Diagrama completo do sistema hidráulico do trator John Deere 6110J',
            tags: ['john deere', '6110j', 'trator', 'hidráulico'],
            fileUrl: 'https://dl.dropboxusercontent.com/s/q7r8s9t0u1v2w3x/deere_hydraulic.pdf',
            imageUrl: 'https://dl.dropboxusercontent.com/s/y4z5a6b7c8d9e0f/mechanical-diagram-tractor.jpg',
            category: 'tractor_hydraulics'
        }
    )
);

module.exports = mockDiagrams;
