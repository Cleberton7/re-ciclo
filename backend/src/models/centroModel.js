// src/models/Empresa.js
import mongoose from "mongoose";

const empresaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  endereco: { type: String },
  telefone: { type: String },
  site: { type: String },
  imagemUrl: { type: String },
}, { timestamps: true });

const Coletor = mongoose.model("coletor", empresaSchema);

export default Coletor;
