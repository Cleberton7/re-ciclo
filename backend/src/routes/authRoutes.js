import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from '../config/config.js';

const router = express.Router();

// Rota de registro
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      senha,
      telefone,
      endereco,
      tipoUsuario,
      // Campos específicos por tipo
      nome,           // para pessoa
      cpf,            // para pessoa
      razaoSocial,    // para empresa
      nomeFantasia,   // para coletor
      cnpj            // para empresa e coletor
    } = req.body;

    console.log('Dados recebidos no backend:', req.body);

    // Validação dos campos obrigatórios comuns
    if (!email || !senha || !telefone || !endereco || !tipoUsuario) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando' });
    }

    // Validações específicas por tipo de usuário
    switch(tipoUsuario) {
      case 'pessoa':
        if (!nome || !cpf) {
          return res.status(400).json({ 
            mensagem: 'Nome e CPF são obrigatórios para pessoa física' 
          });
        }
        break;
      
      case 'empresa':
        if (!razaoSocial || !cnpj) {
          return res.status(400).json({ 
            mensagem: 'Razão Social e CNPJ são obrigatórios para empresas' 
          });
        }
        break;
      
      case 'coletor':
        if (!nomeFantasia || !cnpj) {
          return res.status(400).json({ 
            mensagem: 'Nome Fantasia e CNPJ são obrigatórios para coletores' 
          });
        }
        break;
      
      default:
        return res.status(400).json({ 
          mensagem: 'Tipo de usuário inválido' 
        });
    }

    // Verifica se já existe usuário com o mesmo e-mail
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado!" });
    }

    // Criação do novo usuário com campos específicos
    const userData = {
      email,
      senha,
      telefone,
      endereco,
      tipoUsuario,
      ...(tipoUsuario === 'pessoa' && { 
        nome,
        cpf 
      }),
      ...(tipoUsuario === 'empresa' && { 
        razaoSocial,
        cnpj 
      }),
      ...(tipoUsuario === 'coletor' && { 
        nomeFantasia,
        cnpj 
      })
    };

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Gera o token JWT
    const token = jwt.sign(
      { id: savedUser._id, tipoUsuario: savedUser.tipoUsuario },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Determina o nome a ser exibido conforme o tipo de usuário
    let nomeExibido = '';
    switch(savedUser.tipoUsuario) {
      case 'pessoa': nomeExibido = savedUser.nome; break;
      case 'empresa': nomeExibido = savedUser.razaoSocial; break;
      case 'coletor': nomeExibido = savedUser.nomeFantasia; break;
    }

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso",
      token,
      usuario: {
        id: savedUser._id,
        nome: nomeExibido,
        email: savedUser.email,
        tipoUsuario: savedUser.tipoUsuario
      }
    });

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ 
      mensagem: "Erro no servidor", 
      error: error.message 
    });
  }
});

// Rota de login (mantida sem alterações)
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

    // Determina o nome a ser exibido conforme o tipo de usuário
    let nomeExibido = '';
    switch(user.tipoUsuario) {
      case 'pessoa': nomeExibido = user.nome; break;
      case 'empresa': nomeExibido = user.razaoSocial; break;
      case 'coletor': nomeExibido = user.nomeFantasia; break;
    }

    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

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
    res.status(500).json({ 
      mensagem: "Erro no servidor", 
      detalhes: err.message 
    });
  }
});

export default router;