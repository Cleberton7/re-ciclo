const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cpf: String,
  endereco: String,
  nomeFantasia: String,
  cnpj: String,
  tipoEmpresa: String,
  tipoUsuario: { type: String, enum: ["pessoa", "empresa", "coletor"] }

});

const User = mongoose.model("User", userSchema);

module.exports = User;
