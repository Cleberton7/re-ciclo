const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "sua-chave-secreta"; // Coloque isso no .env futuramente

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Definindo o nome a ser retornado dependendo do tipo de usuário
    const nomeExibido = user.tipoUsuario === "empresa" ? user.nomeFantasia : user.nome;

    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login bem-sucedido!",
      token,
      nome: nomeExibido, // Envia o nome correto para o frontend
      tipoUsuario: user.tipoUsuario
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
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "E-mail já está em uso." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nome,
      email,
      senha: senhaCriptografada,
      cpf,
      endereco,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      tipoUsuario
    });

    await novoUsuario.save();

    res.status(201).json({ message: "Usuário registrado com sucesso!" });

  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};

module.exports = { login, register };
