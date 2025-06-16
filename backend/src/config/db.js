import mongoose from 'mongoose';
import { MONGO_URI, NODE_ENV } from './config.js';

// Conexão principal com tratamento melhorado de erros
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
  maxPoolSize: 10 // Número máximo de conexões no pool
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
  console.log(`📊 Banco de dados: ${mongoose.connection.name}`);
  console.log(`🛠️ Modo: ${NODE_ENV}`);
  console.log(`🔗 URI: ${MONGO_URI.split('@')[1] || MONGO_URI}`); // Mostra apenas a parte segura da URI
})
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  console.error('⏳ Tentando reconectar em 5 segundos...');
  setTimeout(() => process.exit(1), 5000); // Adia a saída para permitir logs
});

// Eventos de conexão melhorados
mongoose.connection.on('connected', () => {
  console.log('📌 Mongoose conectado ao servidor MongoDB');
  console.log(`🔄 Pool de conexões: ${mongoose.connection.readyState === 1 ? 'Ativo' : 'Inativo'}`);
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Erro na conexão do Mongoose:', err.message);
  console.error('📌 Stack:', err.stack);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Mongoose desconectado do MongoDB');
  console.log('⏳ Tentando reconectar...');
  setTimeout(() => mongoose.connect(MONGO_URI), 5000); // Auto-reconexão
});

// Fechamento elegante
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🚪 Conexão com MongoDB fechada devido ao término da aplicação');
  process.exit(0);
});