const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Conectando ao MongoDB com a URL de conexão
    const conn = await mongoose.connect("mongodb://localhost:27017/dbE-cicle");
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Finaliza o processo caso não consiga se conectar
  }
};

module.exports = connectDB; 
