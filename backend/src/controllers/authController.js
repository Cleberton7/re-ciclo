const Usuario = require('../models/Usuario');  // Ajuste conforme seu modelo de usuário
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario'); // Ajuste conforme seu modelo
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email }).select('+senha'); // Garante que a senha seja retornada

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

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

    console.log('Dados do usuário:', {
      id: usuario._id,
      nome: usuario.nome,
      nomeFantasia: usuario.nomeFantasia,
      tipoUsuario: usuario.tipoUsuario,
      nomeExibido // Adicione este log para debug
    });

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
