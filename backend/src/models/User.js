import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Funções de validação (mantidas iguais)
function validarCPF(cpf) {
  if (typeof cpf !== "string") return false;
  cpf = cpf.replace(/[^\d]+/g,'');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

function validarCNPJ(cnpj) {
  if (typeof cnpj !== "string") return false;
  cnpj = cnpj.replace(/[^\d]+/g,'');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0,tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0,tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
}

const UserSchema = new mongoose.Schema({
  razaoSocial: { 
    type: String,
    required: function() { return this.tipoUsuario === 'empresa'; },
  },
  nomeFantasia: {
    type: String,
    required: function() { return this.tipoUsuario === 'centro'; },
  },
  nome: { 
    type: String, 
    required: function() {
      return ['pessoa', 'adminGeral'].includes(this.tipoUsuario);
    },
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido'],
    lowercase: true,
  },
  emailVerificado: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  senha: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false
  },
  endereco: { 
    type: String,
    required: true
  },
  telefone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(v);
      },
      message: props => `${props.value} não é um número de telefone válido`
    }
  },
  imagemPerfil: {
    type: String,
    default: null
  },
  tipoUsuario: { 
    type: String, 
    required: true,
    enum: ['pessoa', 'empresa', 'centro', 'adminGeral'],
    default: 'pessoa'
  },
  recebeResiduoComunidade: {
    type: Boolean,
    default: false,
    required: function() {
      return this.tipoUsuario === 'empresa';
    },
  },
  tiposMateriais: {
    type: [{
      type: String,
      enum: [
        'Telefonia e Acessórios',
        'Informática',
        'Eletrodoméstico',
        'Pilhas e Baterias',
        'Outros Eletroeletrônicos'
      ]
    }],
    default: [],
    required: function() {
      // Obrigatório apenas para empresas que recebem resíduos da comunidade e centros
      return (this.tipoUsuario === 'empresa' && this.recebeResiduoComunidade) || 
             this.tipoUsuario === 'centro';
    },
    validate: {
      validator: function(v) {
        // Para empresas que recebem resíduos, deve ter pelo menos um material selecionado
        if (this.tipoUsuario === 'empresa' && this.recebeResiduoComunidade) {
          return v && v.length > 0;
        }
        // Para centros, deve ter pelo menos um material selecionado
        if (this.tipoUsuario === 'centro') {
          return v && v.length > 0;
        }
        // Para outros casos, não é obrigatório
        return true;
      },
      message: 'Selecione pelo menos um tipo de material'
    }
  },
  cpf: {
    type: String,
    required: function() { return this.tipoUsuario === 'pessoa'; },
    validate: {
      validator: validarCPF,
      message: props => `${props.value} não é um CPF válido`
    }
  },
  cnpj: {
    type: String,
    required: function() {
      return this.tipoUsuario === 'empresa' || this.tipoUsuario === 'centro';
    },
    validate: {
      validator: validarCNPJ,
      message: props => `${props.value} não é um CNPJ válido`
    }
  },
  dataCadastro: { 
    type: Date, 
    default: Date.now 
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: function() {
        return this.tipoUsuario === 'empresa' || this.tipoUsuario === 'centro';
      },
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Coordenadas inválidas. Formato: [longitude, latitude]'
      }
    }
  },
  
  // Mantenha os campos antigos temporariamente para migração
  lat: { type: Number }, // Campo antigo
  lng: { type: Number }  // Campo antigo

}, {
  // CORREÇÃO: Apenas UM objeto de opções com toJSON e toObject
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.senha;
      delete ret.__v;
      // Adicionar campos lat/lng para compatibilidade com frontend existente
      if (ret.localizacao && ret.localizacao.coordinates) {
        ret.lat = ret.localizacao.coordinates[1];
        ret.lng = ret.localizacao.coordinates[0];
      }
      return ret;
    }
  }
});

// Criar índice geoespacial
UserSchema.index({ localizacao: '2dsphere' });

// Virtual para compatibilidade com código existente
UserSchema.virtual('localizacao.lat').get(function() {
  return this.localizacao?.coordinates?.[1];
});

UserSchema.virtual('localizacao.lng').get(function() {
  return this.localizacao?.coordinates?.[0];
});

// Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Middleware para back-compat e sincronização de dados
UserSchema.pre('save', function(next) {
  // Se tiver lat/lng mas não tiver localizacao GeoJSON, criar
  if (this.lat && this.lng && (!this.localizacao || !this.localizacao.coordinates)) {
    this.localizacao = {
      type: 'Point',
      coordinates: [this.lng, this.lat]
    };
  }
  // Se tiver localizacao GeoJSON, manter lat/lng sincronizados
  if (this.localizacao && this.localizacao.coordinates) {
    this.lat = this.localizacao.coordinates[1];
    this.lng = this.localizacao.coordinates[0];
  }
  next();
});

// Middleware para remover imagem ao deletar usuário
UserSchema.pre('remove', async function(next) {
  if (this.imagemPerfil) {
    try {
      const imagePath = path.join(__dirname, '../../uploads', this.imagemPerfil);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
    }
  }
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

export default mongoose.model('User', UserSchema);