# Auto-Elétrica: Configuração do Sistema

Este documento fornece instruções detalhadas para configurar e iniciar o sistema Auto-Elétrica.

## Requisitos do Sistema

- Node.js (v14+)
- MongoDB (v4.4+)
- NPM ou Yarn

## Configuração do Backend

1. **Instale as dependências do backend**

```bash
cd backend
npm install
```

2. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na pasta `backend` ou use o `.env.example` fornecido:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auto-eletrica
JWT_SECRET=sua-chave-secreta
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Configurações de email (necessárias para recuperação de senha)
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASSWORD=sua-senha
FROM_EMAIL=noreply@auto-eletrica.com
FROM_NAME=Auto Elétrica

# Configurações do Cloudinary (necessárias para uploads de imagem)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret
```

3. **Inicialize o usuário administrador**

Para criar um usuário administrador para testes:

```bash
npm run init-admin
```

Isto criará um usuário administrador com as seguintes credenciais:
- **Email**: admin@admin.com
- **Senha**: admin

4. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

O servidor estará disponível em http://localhost:5000

## Configuração do Frontend

1. **Instale as dependências do frontend**

```bash
cd ../frontend
npm install
```

2. **Inicie o servidor de desenvolvimento**

```bash
npm start
```

O frontend estará disponível em http://localhost:3000

## Login como Administrador

1. Acesse http://localhost:3000/login
2. Entre com as credenciais:
   - **Email**: admin@admin.com
   - **Senha**: admin
3. Você será redirecionado para o painel de administração

## Recursos de Administração

No painel de administração, você poderá:

- Gerenciar usuários
- Adicionar/editar veículos
- Adicionar/editar diagramas de rastreamento e auto elétrica
- Gerenciar marcas
- Configurar planos de assinatura
- Ver estatísticas de uso

## Desenvolvimento e Produção

- **Ambiente de desenvolvimento**:
  - Backend: `npm run dev` na pasta backend
  - Frontend: `npm start` na pasta frontend

- **Ambiente de produção**:
  - Backend: `npm start` na pasta backend
  - Frontend: `npm run build` na pasta frontend

## Suporte

Para problemas ou dúvidas, entre em contato em support@auto-eletrica.com