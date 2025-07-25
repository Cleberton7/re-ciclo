import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '../config/emailConfig.js';
import { 
  JWT_SECRET, 
  JWT_EXPIRES_IN, 
  JWT_EMAIL_EXPIRES_IN 
} from '../config/config.js';

export const register = async (req, res) => {
  try {
    const { email, senha, telefone, endereco, tipoUsuario, ...rest } = req.body;

    // Validação dos campos obrigatórios
    const requiredFields = { email, senha, telefone, endereco, tipoUsuario };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        mensagem: 'Campos obrigatórios faltando!',
        campos: missingFields 
      });
    }

    // Verificação de e-mail existente
    if (await User.findOne({ email })) {
      return res.status(400).json({ 
        mensagem: 'E-mail já cadastrado!',
        sugestao: 'Utilize a função de recuperação de senha se necessário'
      });
    }

    // Construção dos dados do usuário
    const userData = {
      email,
      senha,
      telefone: telefone.replace(/\D/g, ''),
      endereco,
      tipoUsuario
    };

    // Validações específicas por tipo de usuário
    const userTypeValidations = {
      pessoa: () => {
        if (!rest.nome || !rest.cpf) throw new Error('Nome e CPF são obrigatórios');
        userData.nome = rest.nome;
        userData.cpf = rest.cpf.replace(/\D/g, '');
      },
      empresa: () => {
        if (!rest.razaoSocial || !rest.cnpj) throw new Error('Razão Social e CNPJ são obrigatórios');
        userData.razaoSocial = rest.razaoSocial;
        userData.cnpj = rest.cnpj.replace(/\D/g, '');
      },
      centro: () => {
        if (!rest.nomeFantasia || !rest.cnpj) throw new Error('Nome Fantasia e CNPJ são obrigatórios');
        userData.nomeFantasia = rest.nomeFantasia;
        userData.cnpj = rest.cnpj.replace(/\D/g, '');
      },
      adminGeral: () => {
        if (!rest.nome) throw new Error('Nome é obrigatório para adminGeral');
        userData.nome = rest.nome;
      }
    };

    if (!userTypeValidations[tipoUsuario]) {
      return res.status(400).json({ mensagem: 'Tipo de usuário inválido' });
    }

    userTypeValidations[tipoUsuario]();

    // Criação do usuário
    const newUser = await User.create(userData);
    
    // Geração de tokens
    const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, { 
      expiresIn: JWT_EMAIL_EXPIRES_IN 
    });
    
    const authToken = jwt.sign(
      { id: newUser._id, tipoUsuario: newUser.tipoUsuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Atualização do usuário com token de verificação
    newUser.emailVerificationToken = verificationToken;
    newUser.emailVerificationExpires = Date.now() + 3600000;
    await newUser.save();
    
    // Envio do e-mail de verificação
    await sendVerificationEmail(newUser, verificationToken);

    // Determinar nome para exibição
    const displayName = newUser.nome || newUser.razaoSocial || newUser.nomeFantasia || newUser.email;

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso. Verifique seu e-mail para ativar sua conta.",
      token: authToken,
      usuario: {
        id: newUser._id,
        nome: displayName,
        email: newUser.email,
        tipoUsuario: newUser.tipoUsuario,
        emailVerificado: newUser.emailVerificado
      }
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        mensagem: 'Erro de validação',
        erros: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(err.message.includes('obrigatório') ? 400 : 500).json({ 
      mensagem: err.message || 'Erro no servidor', 
      erro: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email }).select('+senha');
    
    if (!user || !(await user.comparePassword(senha))) {
      return res.status(401).json({ 
        mensagem: 'Credenciais incorretas' 
      });
    }

    if (!user.emailVerificado) {
      // Gera novo token de verificação
      const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, { 
        expiresIn: JWT_EMAIL_EXPIRES_IN 
      });
      
      user.emailVerificationToken = verificationToken;
      await user.save();
      
      // Envia e-mail de verificação
      await sendVerificationEmail(user, verificationToken);
      
      return res.status(403).json({
        mensagem: 'E-mail não verificado',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }
    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    // Se o e-mail não estiver verificado, envie um novo token de verificação
    if (!user.emailVerificado) {
      const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, { 
        expiresIn: JWT_EMAIL_EXPIRES_IN 
      });
      
      user.emailVerificationToken = verificationToken;
      await user.save();
      await sendVerificationEmail(user, verificationToken);
    }
    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: user._id,
        nome: user.nome || user.razaoSocial || user.nomeFantasia,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
        emailVerificado: user.emailVerificado
      },
      requerVerificacao: !user.emailVerificado

    });

  } catch (err) {
    res.status(500).json({ 
      mensagem: 'Erro no servidor', 
      erro: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    if (user.emailVerificado) {
      return res.status(400).json({ mensagem: 'E-mail já verificado' });
    }
    
    user.emailVerificado = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ mensagem: 'E-mail verificado com sucesso' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ mensagem: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ mensagem: 'Token inválido' });
    }
    res.status(500).json({ mensagem: 'Erro no servidor', erro: err.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    if (user.emailVerificado) {
      return res.status(400).json({ mensagem: 'E-mail já verificado' });
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    
    const sent = await sendVerificationEmail(user, token);
    
    if (!sent) {
      return res.status(500).json({ mensagem: 'Erro ao enviar e-mail de verificação' });
    }
    
    res.json({ mensagem: 'E-mail de verificação reenviado' });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro no servidor', erro: err.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    const sent = await sendPasswordResetEmail(user, token);

    if (!sent) {
      return res.status(500).json({ mensagem: 'Erro ao enviar e-mail de recuperação' });
    }

    res.json({ mensagem: 'E-mail de recuperação enviado' });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro no servidor', erro: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.passwordResetToken !== token || user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ mensagem: 'Token inválido ou expirado' });
    }
    
    user.senha = novaSenha;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ mensagem: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ mensagem: 'Token inválido' });
    }
    res.status(500).json({ mensagem: 'Erro no servidor', erro: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // O usuário já está disponível em req.user pelo middleware
    const user = await User.findById(req.user.id).select('-senha');
    res.json(user);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Erro ao obter perfil",
      error: err.message 
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['nome', 'telefone', 'endereco', 'imagemPerfil'];
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Campos inválidos para atualização"
      });
    }

    const user = await User.findById(req.user.id);
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar perfil",
      error: err.message
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // O middleware já validou o token
    const user = await User.findById(req.user.id).select('-senha');
    
    res.json({ 
      success: true,
      user: {
        id: user._id,
        tipoUsuario: user.tipoUsuario,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: "Falha na verificação" 
    });
  }
};

export const verifyAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('nome razaoSocial nomeFantasia email tipoUsuario emailVerificado');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado' 
      });
    }

    // Lógica aprimorada para displayName
    const displayName = (() => {
      switch(user.tipoUsuario) {
        case 'empresa': return user.razaoSocial || user.nomeFantasia || user.email;
        case 'centro': return user.nomeFantasia || user.email;
        default: return user.nome || user.email;
      }
    })();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        displayName,
        tipoUsuario: user.tipoUsuario,
        email: user.email,
        emailVerificado: user.emailVerificado,
        // Mantém campos específicos para compatibilidade
        nome: user.nome,
        razaoSocial: user.razaoSocial,
        nomeFantasia: user.nomeFantasia
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    // Tratamento específico para erros do Mongoose
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_USER_ID',
        message: 'ID do usuário inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};