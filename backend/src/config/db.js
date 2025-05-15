mongoose.connect(process.env.MONGO_URI || process.env.DB_URI || 'mongodb://localhost:27017/e-cicle')
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    console.log(`📊 Banco de dados: ${mongoose.connection.name}`);
    console.log(`🛠️ Modo: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra o aplicativo se não conseguir conectar
  });mongoose.connection.on('connected', () => {
    console.log('📌 Mongoose conectado ao servidor MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('⚠️ Erro na conexão do Mongoose:', err.message);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('🔌 Mongoose desconectado do MongoDB');
  });