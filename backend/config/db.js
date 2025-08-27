const mongoose = require('mongoose');
const { DEMO_MODE } = require('../utils/demoMode');

const connectDB = async () => {
  // Forçar o modo de demonstração para testes
  DEMO_MODE.enabled = true;
  console.log('===== MODO DE DEMONSTRAÇÃO ATIVADO =====');
  console.log('Login de admin: admin@admin.com / senha: admin');
  console.log('======================================');
  return false;

  /* 
  // Código comentado - não tentaremos conectar ao MongoDB
  try {
    // Tenta conectar ao MongoDB conforme a configuração
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);

    // Desativa o modo de demonstração se a conexão for bem-sucedida
    DEMO_MODE.enabled = false;

    return true;
  } catch (error) {
    console.error(`Erro ao conectar no MongoDB externo: ${error.message}`);
    console.log('Tentando conectar ao MongoDB local...');

    try {
      // Tenta conectar ao MongoDB local
      const localConn = await mongoose.connect('mongodb://localhost:27017/auto-eletrica', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB local conectado: ${localConn.connection.host}`);

      // Desativa o modo de demonstração se a conexão local for bem-sucedida
      DEMO_MODE.enabled = false;

      return true;
    } catch (localError) {
      console.error(`Erro ao conectar no MongoDB local: ${localError.message}`);
      console.log('Ativando modo de demonstração (dados simulados)...');

      // Ativa o modo de demonstração
      DEMO_MODE.enabled = true;

      console.log('===== MODO DE DEMONSTRAÇÃO ATIVADO =====');
      console.log('Login de admin: admin@admin.com / senha: admin');
      console.log('======================================');

      return false;
    }
  }
  */
};

module.exports = connectDB;
