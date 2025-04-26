const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cpf: { type: String, required: false },  // O CPF pode ser opcional para empresas
  endereco: { type: String, required: false },
  nomeFantasia: { type: String, required: false },
  cnpj: { type: String, required: false },
  tipoEmpresa: { type: String, enum: ["pessoa", "empresa", "coletor"], required: true },
  tipoUsuario: { type: String, enum: ["pessoa", "empresa", "coletor"], required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
