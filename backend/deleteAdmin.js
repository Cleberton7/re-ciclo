import mongoose from 'mongoose';
import User from '../backend/src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.deleteOne({ tipoUsuario: 'admin' });
    
    if (result.deletedCount > 0) {
      console.log('Admin deletado com sucesso.');
    } else {
      console.log('Nenhum admin encontrado para deletar.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao deletar admin:', error);
  }
}

deleteAdmin();
