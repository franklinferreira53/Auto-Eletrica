# Auto-Elétrica: Sistema de Diagramas Técnicos Automotivos

Sistema completo para profissionais de auto elétrica e instaladores de rastreamento veicular, com diagramas detalhados para diversos modelos de veículos.

## Funcionalidades

### Para Instaladores de Rastreamento:
- Diagramas de instalação específicos por veículo
- Informações precisas sobre localização e cores de fios:
  - Fios positivos
  - Fios negativos
  - Fios pós-chave
  - Fios para bloqueio
- Pesquisa por modelo, marca e ano

### Para Auto Elétrica:
- Diagramas elétricos completos
- Esquemas detalhados de sistemas automotivos
- Bibliotecas de componentes eletrônicos
- Visualização interativa dos diagramas

### Sistema de Gerenciamento:
- Painel administrativo completo
- Gestão de assinaturas
- Controle de usuários
- Relatórios de utilização

## Tecnologias

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Material-UI
- **Mobile**: React Native
- **Autenticação**: JWT
- **Armazenamento**: MongoDB e Cloudinary para arquivos

## Instalação

### Pré-requisitos
- Node.js (v14+)
- MongoDB
- NPM ou Yarn

### Configuração do Backend

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/auto-eletrica.git
cd auto-eletrica

# Instalar dependências do backend
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar o servidor
npm run dev
```

### Configuração do Frontend

```bash
# Na pasta raiz do projeto
cd frontend
npm install
npm start
```

### Configuração do App Mobile

```bash
# Na pasta raiz do projeto
cd mobile
npm install
npx react-native run-android
# ou
npx react-native run-ios
```

## Estrutura do Projeto

```
auto-eletrica/
├── backend/           # API e servidor
│   ├── controllers/   # Controladores da API
│   ├── models/        # Modelos de dados
│   ├── routes/        # Rotas da API
│   ├── middleware/    # Middleware (autenticação, etc.)
│   └── services/      # Serviços de negócios
├── frontend/          # Interface web
│   ├── public/        # Arquivos estáticos
│   └── src/           # Código fonte React
├── mobile/            # Aplicativo móvel
│   ├── android/       # Configurações para Android
│   └── ios/           # Configurações para iOS
└── docs/              # Documentação adicional
```

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor
Franklin Ferreira