import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, senha, telefone, endereco, tipoUsuario, ...rest } = req.body;

    if (!email || !senha || !telefone || !endereco || !tipoUsuario) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios faltando!' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado!' });
    }

    const userData = {
      email,
      senha,
      telefone: telefone.replace(/\D/g, ''),
      endereco,
      tipoUsuario
    };

    switch(tipoUsuario) {
      case 'pessoa':
        if (!rest.nome || !rest.cpf) {
          return res.status(400).json({ mensagem: 'Nome e CPF são obrigatórios' });
        }
        userData.nome = rest.nome;
        userData.cpf = rest.cpf.replace(/\D/g, '');
        break;
      case 'empresa':
        if (!rest.razaoSocial || !rest.cnpj) {
          return res.status(400).json({ mensagem: 'Razão Social e CNPJ são obrigatórios' });
        }
        userData.razaoSocial = rest.razaoSocial;
        userData.cnpj = rest.cnpj.replace(/\D/g, '');
        break;
      case 'coletor':
        if (!rest.nomeFantasia || !rest.cnpj) {
          return res.status(400).json({ mensagem: 'Nome Fantasia e CNPJ são obrigatórios' });
        }
        userData.nomeFantasia = rest.nomeFantasia;
        userData.cnpj = rest.cnpj.replace(/\D/g, '');
        break;
      case 'adminGeral':
        if (!rest.nome) {
          return res.status(400).json({ mensagem: 'Nome é obrigatório para adminGeral' });
        }
        userData.nome = rest.nome;
        break;
      default:
        return res.status(400).json({ mensagem: 'Tipo de usuário inválido' });
    }

    const newUser = await User.create(userData);
    
    const token = jwt.sign(
      { id: newUser._id, tipoUsuario: newUser.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso",
      token,
      usuario: newUser
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        mensagem: 'Erro de validação',
        erros: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      mensagem: 'Erro no servidor', 
      erro: err.message 
    });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email }).select('+senha');
    
    if (!user || !(await user.comparePassword(senha))) {
      return res.status(401).json({ mensagem: 'Credenciais incorretas' });
    }

    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: user
    });

  } catch (err) {
    res.status(500).json({ 
      mensagem: 'Erro no servidor', 
      erro: err.message 
    });
  }
};