const Usuario = require('../models/Usuario');  // Ajuste conforme seu modelo de usuário
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario'); // Ajuste conforme seu modelo
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para realizar o login
async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Buscar usuário pelo e-mail
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verificar a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    // Determinar qual campo utilizar para o nome
    const nome = usuario.tipoUsuario === 'empresa' && usuario.nomeFantasia ? usuario.nomeFantasia : usuario.nome;

    // Verifique se o nome está sendo recuperado corretamente
    console.log("Nome recuperado do banco de dados:", nome); // Adicione esse log

    // Gerar o token JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Retornar a resposta com nome e token
    res.json({
      mensagem: 'Login bem-sucedido!',
      token,
      nome: nome || 'Nome não encontrado', // Garantir que o nome não é vazio
      tipoUsuario: usuario.tipoUsuario
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}


// Função de registro
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
    // Verifica se o usuário já existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "E-mail já está em uso." });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o novo usuário
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
// Verificação adicional para o tipo 'coletor'
if (tipoUsuario === "coletor") {
  if (!nomeFantasia) {
    return res.status(400).json({ error: "Nome fantasia é obrigatório para coletor." });
  }
  // Garante que o nomeFantasia será usado como nome principal
  novoUsuario.nome = nomeFantasia;
}
    // Salva o usuário no banco de dados
    await novoUsuario.save();

    res.status(201).json({ message: "Usuário registrado com sucesso!" });

  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};

module.exports = { login, register };
