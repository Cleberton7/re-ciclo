// seedDatabase.js
import mongoose from 'mongoose';
import Coleta from './models/coletaModel.js';
import User from './models/userModel.js';

const seed = async () => {
  // Conecte ao banco de dados
  await mongoose.connect('mongodb://localhost:27017/seu-banco');

  // Crie algumas empresas
  const empresa1 = await User.create({
    nome: 'Empresa A',
    email: 'empresaA@teste.com',
    tipoUsuario: 'empresa',
    nomeFantasia: 'Recicla Mais',
    razaoSocial: 'Recicla Mais LTDA'
  });

  // Crie coletas públicas
  await Coleta.create([
    {
      solicitante: empresa1._id,
      tipoMaterial: 'plásticos',
      quantidade: 150,
      endereco: 'Rua Teste, 123',
      status: 'concluída',
      privacidade: 'publica'
    },
    // Adicione mais coletas conforme necessário
  ]);

  console.log('Dados de teste criados com sucesso!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Erro ao criar dados de teste:', err);
  process.exit(1);
});