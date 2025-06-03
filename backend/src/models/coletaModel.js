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
  observacoes: {
    type: String
  },
  // Para avaliação pós-coleta
  avaliacao: {
    type: Number,
    min: 1,
    max: 5
  },
  imagem: {
    type: String // Armazenará o caminho da imagem
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para consultas frequentes
coletaSchema.index({ solicitante: 1 });
coletaSchema.index({ coletor: 1 });
coletaSchema.index({ status: 1 });
coletaSchema.index({ tipoMaterial: 1 });

export default mongoose.model('Coleta', coletaSchema);