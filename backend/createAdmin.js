import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const adminExists = await User.findOne({ tipoUsuario: 'adminGeral', email: 'admin@exemplo.com' });
  if (adminExists) {
    console.log('Admin já existe');
    return process.exit(0);
  }

  const admin = new User({
    nome: 'Administrador Geral',
    email: 'admin@exemplo.com',
    senha: '123456789',
    tipoUsuario: 'adminGeral',
    documento: '00000000000',
    endereco: 'Endereço administrativo',
    telefone: '00000000000'
  });

  await admin.save();
  console.log('Admin criado com sucesso!');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});