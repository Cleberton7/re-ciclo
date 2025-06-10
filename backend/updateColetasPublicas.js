// updateColetasPublicas.js
import mongoose from 'mongoose';
import Coleta from './src/models/coletaModel.js';

async function updateColetas() {
  await mongoose.connect('mongodb://localhost:27017/db');


  // Atualiza todas as coletas aceitas para status concluída e públicas
  const result = await Coleta.updateMany(
    { status: 'aceita' },
    { 
      $set: { 
        status: 'concluída',
        privacidade: 'publica'
      } 
    }
  );

  console.log(`Atualizadas ${result.modifiedCount} coletas`);
  process.exit(0);
}

updateColetas().catch(err => {
  console.error('Erro ao atualizar coletas:', err);
  process.exit(1);
});