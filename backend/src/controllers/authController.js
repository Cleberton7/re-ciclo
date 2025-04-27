const Usuario = require('../models/User'); // Ajuste conforme seu modelo de usuário
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Função de login
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifica se o usuário existe
    const usuario = await Usuario.findOne({ email }).select('+senha'); // Garante que a senha seja retornada

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    // Verifica se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Lógica robusta para determinar o nome de exibição
    let nomeExibido;
    switch(usuario.tipoUsuario) {
      case 'pessoa':
        nomeExibido = usuario.nome || 'Usuário';
        break;
      case 'coletor':
        nomeExibido = usuario.nomeFantasia || usuario.nome || 'Coletor';
        break;
      case 'empresa':
        nomeExibido = usuario.nomeFantasia || usuario.nome || 'Empresa';
        break;
      default:
        nomeExibido = 'Usuário';
    }

    // Log para depuração
    console.log('Dados do usuário:', {
      id: usuario._id,
      nome: usuario.nome,
      nomeFantasia: usuario.nomeFantasia,
      tipoUsuario: usuario.tipoUsuario,
      nomeExibido // Adicionando nome exibido para depuração
    });

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario._id, tipoUsuario: usuario.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      mensagem: "Login bem-sucedido!",
      token,
      nome: nomeExibido, // Garantindo que sempre terá um valor
      tipoUsuario: usuario.tipoUsuario
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
const register = async (req, res) => {
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
    // Log dos dados recebidos para verificar
    console.log("Dados recebidos no registro:", req.body);

    // Verifica se o usuário já existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "E-mail já está em uso." });
    }

    // Atribui nomeFantasia ao nome caso o nome esteja vazio
    let nomeFinal = nome || (tipoUsuario === "empresa" || tipoUsuario === "coletor" ? nomeFantasia : null);

    // Se nomeFinal for vazio, retorna um erro
    if (!nomeFinal) {
      return res.status(400).json({ error: "Nome é obrigatório." });
    }

    // Criptografando a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criando o novo usuário
    const novoUsuario = new User({
      nome: nomeFinal,
      email,
      senha: senhaCriptografada,
      cpf,
      endereco,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      tipoUsuario
    });

    // Salvando no banco de dados
    await novoUsuario.save();

    return res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });

  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro ao registrar usuário.", details: err.message });
  }
};


module.exports = { login, register };
