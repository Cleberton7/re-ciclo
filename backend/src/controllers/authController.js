import User from '../models/User.js';
import jwt from 'jsonwebtoken';

//console.log('JWT_SECRET carregado:', process.env.JWT_SECRET?.substring(0, 10) + '...');

export const register = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario, ...rest } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado!' });
    }

    const newUser = new User({
      nome,
      email,
      senha,
      tipoUsuario,
      ...rest,
    });

    await newUser.save();
    
    const token = jwt.sign(
      { id: newUser._id, tipoUsuario: newUser.tipoUsuario },
      process.env.JWT_SECRET,
      { 
        algorithm: 'HS256',
        expiresIn: "1h" 
      }
    );

    //console.log('Token gerado no registro:', token.substring(0, 20) + '...');

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso",
      token,
      usuario: { 
        nome: newUser.nome, 
        email: newUser.email, 
        tipoUsuario: newUser.tipoUsuario 
      },
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ 
      mensagem: 'Erro no servidor', 
      erro: err.message 
    });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body;
  //console.log('Iniciando login para:', email);

  try {
    const user = await User.findOne({ email });
    if (!user || !user.comparePassword(senha)) {
      return res.status(401).json({ mensagem: 'Credenciais incorretas' });
    }
    
    // No authController.js corrigir:
    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario }, // ERRADO: usuario._id
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    //console.log('Secret usado para gerar token:', process.env.JWT_SECRET?.substring(0, 10) + '...');
    //console.log('Token gerado no login:', token.substring(0, 20) + '...');

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: { 
        nome: user.nome, 
        email: user.email, 
        tipoUsuario: user.tipoUsuario 
      },
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      mensagem: 'Erro no servidor', 
      erro: err.message 
    });
  }
};