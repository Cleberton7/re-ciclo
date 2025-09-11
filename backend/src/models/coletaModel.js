import mongoose from 'mongoose';

const coletaSchema = new mongoose.Schema({
  codigoRastreamento: {
    type: String,
    unique: true,
    sparse: true
  },
  solicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoMaterial: {
    type: String,
    required: true,
    enum: ['telefonia', 'informatica', 'eletrodomesticos', 'pilhas_baterias', 'outros'],
    default: 'outros'
  },
  quantidade: {
    type: Number,
    required: true,
    min: 1
  },
  endereco: {
    type: String,
    required: true
  },
  dataSolicitacao: {
    type: Date,
    default: Date.now
  },
  dataColeta: {
    type: Date
  },
  centro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pendente', 'agendada', 'em_andamento', 'concluída', 'cancelada'],
    default: 'pendente'
  },
  privacidade: {
    type: String,
    enum: ['publica', 'privada'],
    default: 'publica'
  },
  observacoes: {
    type: String
  },
  avaliacao: {
    type: Number,
    min: 1,
    max: 5
  },
  imagem: {
    type: String
  },
  impactoAmbiental: {  // NOVO CAMPO ADICIONADO
    type: Number,
    default: 0
  },
  materiaisSeparados: {
    type: {
      eletronicos: {
        quantidade: { type: Number, min: 0 },
        componentes: { type: String }
      },
      metais: {
        quantidade: { type: Number, min: 0 }
      },
      plasticos: {
        quantidade: { type: Number, min: 0 }
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


coletaSchema.index({
  status: 1,
  privacidade: 1,
  tipoMaterial: 1,
  createdAt: 1,
  solicitante: 1,
  centro: 1
});
// Middleware para gerar código de rastreamento antes de salvar e calcular impacto ambiental
coletaSchema.pre('save', async function(next) {
  if (this.isNew && !this.codigoRastreamento) {
    this.codigoRastreamento = await gerarCodigoRastreamento();
  }
  
  if (this.isModified('quantidade')) {
    this.impactoAmbiental = this.quantidade * 0.5;
  }
  next();
});
// Função para gerar código de rastreamento único
async function gerarCodigoRastreamento() {
  const now = new Date();
  const dataPart = now.toISOString().slice(0, 10).replace(/-/g, '');
  
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const coletasDoDia = await mongoose.model('Coleta').countDocuments({
    createdAt: { $gte: startOfDay },
    codigoRastreamento: { $exists: true }
  });
  
  const sequencia = (coletasDoDia + 1).toString(); // Remova o padStart para números simples
  return `${dataPart}-${sequencia}`;
}


export default mongoose.model('Coleta', coletaSchema);