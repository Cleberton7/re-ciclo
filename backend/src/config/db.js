const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Conectar ao MongoDB sem usar as opções obsoletas
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Finaliza o processo caso haja erro de conexão
  }
};

module.exports = connectDB;
