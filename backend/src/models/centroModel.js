const mongoose = require("mongoose");

const empresaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  endereco: { type: String },
  telefone: { type: String },
  site: { type: String },
  imagemUrl: { type: String } // Se quiser guardar uma imagem
}, { timestamps: true });

const Empresa = mongoose.model("coletor", empresaSchema);

module.exports = Empresa;
