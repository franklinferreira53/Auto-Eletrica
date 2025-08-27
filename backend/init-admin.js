const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { DEMO_MODE } = require('./utils/demoMode');

// Função para verificar se estamos no modo de demonstração
const isDemoMode = () => DEMO_MODE.enabled;

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelo de usuário
let User;
try {
  User = require('./models/User');
} catch (error) {
  // Se houver erro ao importar, definir o modelo diretamente
  console.log('Definindo modelo de usuário diretamente...');
  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    emailVerified: Boolean,
    active: Boolean,
    profileType: String,
    company: String,
    phone: String,
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    subscriptionStatus: String,
    subscriptionExpiryDate: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  User = mongoose.model('User', UserSchema);
}

const createAdminUser = async () => {
  try {
    // Verificar se estamos em modo demo
    if (isDemoMode()) {
      console.log('Modo de demonstração ativado - as credenciais são:');
      console.log('Email: admin@admin.com');
      console.log('Senha: admin');
      return;
    }

    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');

    // Verificar se já existe um usuário admin
    const adminExists = await User.findOne({ email: 'admin@admin.com' });

    if (adminExists) {
      console.log('Usuário administrador já existe.');
      console.log('Email: admin@admin.com');
      console.log('Senha: admin');
    } else {
      // Criar hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);

      // Criar o usuário admin
      const admin = new User({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        profileType: 'admin',
        emailVerified: true,
        active: true,
      });

      await admin.save();

      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@admin.com');
      console.log('Senha: admin');
    }

    mongoose.disconnect();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error('Erro:', error);
  }
};

// Exportar a função para uso no server.js
module.exports = createAdminUser;

// Executar se for chamado diretamente
if (require.main === module) {
  createAdminUser();
}