const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Importando o modelo User


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
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado!" });
    }

    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o número de "salt rounds"

    const newUser = new User({
      nome,
      email,
      senha: hashedPassword, // salva a senha criptografada
      cpf,
      endereco,
      nomeFantasia,
      cnpj,
      tipoEmpresa,
      tipoUsuario
    });

    const savedUser = await newUser.save();
    res.status(201).json({ mensagem: "Usuário registrado com sucesso", savedUser });

  } catch (error) {
    console.error("Erro ao registrar:", error);
    res.status(500).json({ mensagem: "Erro no servidor", error });
  }
});


const jwt = require("jsonwebtoken");
const SECRET = "sua_chave_secreta"; // Ideal usar variável de ambiente

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ mensagem: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ mensagem: "Senha incorreta" });

    const token = jwt.sign(
      { id: user._id, tipoUsuario: user.tipoUsuario, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      mensagem: "Login bem-sucedido!",
      token,
      nome: user.nome, // <-- envia o nome para o frontend
    });
  } catch (err) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: err.message });
  }
});



module.exports = router;
