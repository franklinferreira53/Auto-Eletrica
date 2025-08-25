# Auto-Elétrica System

Sistema completo para instaladores de equipamentos automotivos e rastreamento veicular.

## Visão Geral

O Auto-Elétrica é um sistema web que permite aos instaladores de equipamentos automotivos:

- **Consultar diagramas de instalação** para diferentes modelos de veículos
- **Gerenciar base de dados de veículos** com especificações técnicas
- **Acesso baseado em funções** (usuário regular e administrador)
- **Interface responsiva** que funciona em desktop e mobile

## Funcionalidades

### Para Usuários
- ✅ Cadastro e autenticação
- ✅ Navegação por diagramas de instalação
- ✅ Busca e filtros por veículos
- ✅ Visualização de especificações técnicas
- ✅ Sistema de curtidas em diagramas

### Para Administradores
- ✅ Gerenciamento de usuários
- ✅ Criação e edição de diagramas
- ✅ Gerenciamento de veículos
- ✅ Relatórios e estatísticas

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

### Frontend
- **React** - Biblioteca para interfaces
- **Material UI** - Componentes e design system
- **React Router** - Navegação SPA
- **Axios** - Cliente HTTP
- **Vite** - Build tool e dev server

## Estrutura do Projeto

```
Auto-Eletrica/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   └── Diagram.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── vehicles.js
│   │   └── diagrams.js
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- MongoDB
- npm ou yarn

### Backend

1. Navegue para a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autoeletrica
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRE=7d
```

5. Inicie o servidor:
```bash
npm run dev
```

O backend estará disponível em `http://localhost:5000`

### Frontend

1. Navegue para a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/refresh` - Renovar token

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Desativar usuário (admin)

### Veículos
- `GET /api/vehicles` - Listar veículos
- `GET /api/vehicles/:id` - Obter veículo
- `POST /api/vehicles` - Criar veículo
- `PUT /api/vehicles/:id` - Atualizar veículo
- `DELETE /api/vehicles/:id` - Remover veículo
- `GET /api/vehicles/search` - Buscar veículos

### Diagramas
- `GET /api/diagrams` - Listar diagramas
- `GET /api/diagrams/:id` - Obter diagrama
- `POST /api/diagrams` - Criar diagrama
- `PUT /api/diagrams/:id` - Atualizar diagrama
- `DELETE /api/diagrams/:id` - Remover diagrama
- `POST /api/diagrams/:id/like` - Curtir/descurtir diagrama
- `GET /api/diagrams/search` - Buscar diagramas

## Modelos de Dados

### Usuário
```javascript
{
  name: String,
  email: String,
  password: String,
  role: 'user' | 'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Veículo
```javascript
{
  brand: String,
  model: String,
  year: Number,
  category: 'carro' | 'moto' | 'caminhao' | 'onibus' | 'van',
  fuelType: 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'eletrico' | 'hibrido',
  transmission: 'manual' | 'automatico' | 'cvt',
  engine: String,
  description: String,
  specifications: Object,
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Diagrama
```javascript
{
  title: String,
  description: String,
  vehicle: ObjectId,
  category: String,
  difficulty: 'basico' | 'intermediario' | 'avancado',
  estimatedTime: String,
  tools: Array,
  materials: Array,
  steps: Array,
  images: Array,
  tags: Array,
  isPublic: Boolean,
  isActive: Boolean,
  views: Number,
  likes: Array,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Franklin Ferreira - [@franklinferreira53](https://github.com/franklinferreira53)

Link do Projeto: [https://github.com/franklinferreira53/Auto-Eletrica](https://github.com/franklinferreira53/Auto-Eletrica)