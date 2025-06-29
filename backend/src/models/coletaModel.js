import mongoose from 'mongoose';

const coletaSchema = new mongoose.Schema({
  solicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoMaterial: {
    type: String,
    required: true,
    enum: ['eletrônicos', 'metais', 'plásticos', 'outros'],
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
  privacidade: {  // NOVO CAMPO ADICIONADO
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
// Middleware para calcular impacto ambiental antes de salvar
coletaSchema.pre('save', function(next) {
  if (this.isModified('quantidade')) {
    // Fórmula exemplo: 1kg de material reciclado = 0.5kg de CO2 evitado
    this.impactoAmbiental = this.quantidade * 0.5;
  }
  next();
});

export default mongoose.model('Coleta', coletaSchema);