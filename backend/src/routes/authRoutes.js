const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "sua_chave_secreta";

// Rota para cadastro de usuário
router.post("/register", async (req, res) => {
  const {
    nome,
    email,
    senha,
    cpf,
    endereco,
    nomeFantasia,
    cnpj,
    tipoEmpresa,
    tipoUsuario
  } = req.body;

  try {
    // Verifica se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado!" });
    }

    // Validações específicas para coletores
    if (tipoUsuario === "coletor") {
      if (!nomeFantasia) {
        return res.status(400).json({ mensagem: "Nome fantasia é obrigatório para coletores" });
      }
    }

    // Log para verificar os dados recebidos
    console.log("Dados recebidos no registro:", {
      nome,
      email,
      senha,
      cpf,
      endereco,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      tipoUsuario
    });

    // Cria o novo usuário
    const newUser = new User({
      nome: tipoUsuario === "coletor" ? nomeFantasia : nome,
      email,
      senha: await bcrypt.hash(senha, 10),
      cpf,
      endereco,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      tipoUsuario
    });

    // Salva o usuário no banco de dados
    const savedUser = await newUser.save();

    // Resposta de sucesso
    res.status(201).json({ 
      mensagem: "Usuário registrado com sucesso",
      usuario: {
        id: savedUser._id,
        nome: savedUser.nome,
        email: savedUser.email,
        tipoUsuario: savedUser.tipoUsuario
      }
    });

  } catch (error) {
    // Log do erro completo para melhor depuração
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ 
      mensagem: "Erro no servidor",
      error: error.message 
    });
  }
});

// Rota para login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca usuário no banco de dados
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ mensagem: "Usuário não encontrado" });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    // Determina o nome a ser exibido
    let nomeExibido;
    switch(user.tipoUsuario) {
      case 'pessoa':
        nomeExibido = user.nome || 'Usuário';
        break;
      case 'coletor':
        nomeExibido = user.nomeFantasia || user.nome || 'Coletor';
        break;
      case 'empresa':
        nomeExibido = user.nomeFantasia || user.nome || 'Empresa';
        break;
      default:
        nomeExibido = 'Usuário';
    }

    // Gera o token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        tipoUsuario: user.tipoUsuario, 
        email: user.email 
      },
      SECRET,
      { expiresIn: "1h" }
    );

    // Log para debug
    console.log('Login realizado:', {
      userId: user._id,
      tipoUsuario: user.tipoUsuario,
      nomeExibido
    });

    // Retorna a resposta com sucesso
    res.json({
      mensagem: "Login bem-sucedido!",
      token,
      nome: nomeExibido,
      tipoUsuario: user.tipoUsuario,
      email: user.email
    });

  } catch (err) {
    // Log do erro completo para melhor depuração
    console.error("Erro no login:", err);
    res.status(500).json({ 
      mensagem: "Erro no servidor", 
      erro: err.message 
    });
  }
});

module.exports = router;
