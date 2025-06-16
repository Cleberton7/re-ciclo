import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js'; // Ajuste o caminho conforme sua estrutura

// Carrega as variáveis de ambiente
dotenv.config();

// Função principal
async function verifyAllEmails() {
  try {
    // Conecta ao MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB');

    // Atualiza todos os usuários
    const result = await User.updateMany(
      {}, // Filtro vazio para selecionar todos os documentos
      { 
        $set: { 
          emailVerificado: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        } 
      }
    );

    console.log(`✅ ${result.modifiedCount} usuários atualizados com sucesso`);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
  } finally {
    // Desconecta do MongoDB
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Executa o script
verifyAllEmails();