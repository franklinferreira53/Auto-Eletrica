const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const diagramRoutes = require('./routes/diagramRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const brandRoutes = require('./routes/brandRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Inicializar Express
const app = express();

// Conectar ao banco de dados
connectDB();

// Importar inicializador de admin
const createAdminUser = require('./init-admin');

// Inicializar usuário administrador
const initializeAdmin = async () => {
  try {
    await createAdminUser();
    console.log('===== MODO DE DEMONSTRAÇÃO ATIVADO =====');
    console.log('Login de admin: admin@admin.com / senha: admin');
    console.log('========================================');
  } catch (err) {
    console.error('Erro ao inicializar admin:', err);
  }
};

// Executar inicialização
initializeAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// Logging em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Diretório de uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota básica para testar API
app.get('/', (req, res) => {
  res.json({
    message: 'API do Sistema Auto Elétrica está funcionando!',
    version: '1.0.0',
  });
});

// Middleware de erro
app.use(notFound);
app.use(errorHandler);

// Porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando no modo ${process.env.NODE_ENV} na porta ${PORT}`);
});