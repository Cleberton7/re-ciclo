import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from '../config/config.js';

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, cpf, endereco, nomeFantasia, cnpj, tipoUsuario } = req.body;

    if (!nome || !email || !senha || !tipoUsuario) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando' });
    }
    if (tipoUsuario === 'pessoa' && !cpf) {
      return res.status(400).json({ mensagem: 'CPF é obrigatório para pessoa física' });
    }
    if (tipoUsuario === 'empresa' && !cnpj) {
      return res.status(400).json({ mensagem: 'CNPJ é obrigatório para empresas' });
    }
    if (tipoUsuario === 'empresa' && !nomeFantasia) {
      return res.status(400).json({ mensagem: 'Nome fantasia é obrigatório para empresas' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado!" });
    }

    const newUser = new User({
      nome: tipoUsuario === 'pessoa' ? nome : nomeFantasia,
      email,
      senha,
      ...(tipoUsuario === 'pessoa' && { documento: cpf }),
      ...((tipoUsuario === 'empresa' || tipoUsuario === 'coletor') && { 
        documento: cnpj,
        razaoSocial: tipoUsuario === 'empresa' ? nomeFantasia : (nomeFantasia || nome)
      }),
      endereco,
      tipoUsuario
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, tipoUsuario: savedUser.tipoUsuario },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso",
      token,
      usuario: {
        id: savedUser._id,
        nome: savedUser.nome,
        email: savedUser.email,
        tipoUsuario: savedUser.tipoUsuario
      }
    });

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ mensagem: "Erro no servidor", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios" });
    }

    const user = await User.findOne({ email }).select('+senha');
    if (!user) {
      return res.status(401).json({ mensagem: "E-mail não encontrado" });
    }

    const senhaValida = await user.comparePassword(senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const nomeExibido = user.tipoUsuario === 'pessoa' ? user.nome : user.razaoSocial || user.nome;

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: user._id,
        nome: nomeExibido,
        email: user.email,
        tipoUsuario: user.tipoUsuario
      }
    });

  } catch (err) {
    console.error('[BACKEND ERRO]', err);
    res.status(500).json({ mensagem: "Erro no servidor", detalhes: err.message });
  }
});

export default router;
