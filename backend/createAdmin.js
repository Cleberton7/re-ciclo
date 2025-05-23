import mongoose from 'mongoose';
import User from '../backend/src/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminExists = await User.findOne({ tipoUsuario: 'admGeral', email: 'admin@exemplo.com' });
  if (adminExists) {
    console.log('Admin já existe');
    process.exit(0);
  }

  const admin = new User({
    nome: 'Administrador',
    email: 'admin@exemplo.com',
    senha: '123456789', // Vai ser criptografada no pre-save do schema
    tipoUsuario: 'admGeral',
    documento: '00000000000', // ou outro dado que faça sentido
  });

  await admin.save();
  console.log('Admin criado com sucesso!');
  process.exit(0);
}

createAdmin().catch(console.error);
