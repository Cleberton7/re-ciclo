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
  coletor: {
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices atualizados
coletaSchema.index({ solicitante: 1 });
coletaSchema.index({ coletor: 1 });
coletaSchema.index({ status: 1 });
coletaSchema.index({ tipoMaterial: 1 });
coletaSchema.index({ privacidade: 1 });  // NOVO ÍNDICE
coletaSchema.index({ createdAt: 1 });    // NOVO ÍNDICE

// Middleware para calcular impacto ambiental antes de salvar
coletaSchema.pre('save', function(next) {
  if (this.isModified('quantidade')) {
    // Fórmula exemplo: 1kg de material reciclado = 0.5kg de CO2 evitado
    this.impactoAmbiental = this.quantidade * 0.5;
  }
  next();
});

export default mongoose.model('Coleta', coletaSchema);