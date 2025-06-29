import mongoose from 'mongoose';
import 'dotenv/config';
import Coleta from './src/models/coletaModel.js'; // Certifique-se da extensão .js

async function migrar() {
  try {
    // Conecta ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nome_do_seu_banco', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado ao MongoDB...');
    
    // Atualiza os documentos
    const resultado = await Coleta.updateMany(
      { status: 'concluída', materiaisSeparados: { $exists: false } },
      [{
        $set: { 
          "materiaisSeparados": {
            "eletronicos": {
              "quantidade": {
                $cond: [{ $eq: ["$tipoMaterial", "eletrônicos"] }, "$quantidade", 0]
              },
              "componentes": { $ifNull: ["$observacoes", ""] }
            },
            "metais": {
              "quantidade": {
                $cond: [{ $eq: ["$tipoMaterial", "metais"] }, "$quantidade", 0]
              }
            },
            "plasticos": {
              "quantidade": {
                $cond: [{ $eq: ["$tipoMaterial", "plásticos"] }, "$quantidade", 0]
              }
            }
          }
        } 
      }]
    );

    console.log(`✅ Documentos atualizados: ${resultado.modifiedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    process.exit(1);
  }
}

migrar();