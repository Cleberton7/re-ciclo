
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Importando o modelo User

// Rota para cadastro de usuário
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Verificar se o usuário já existe
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ mensagem: "Usuário já existe!" });
  }

  // Criar um novo usuário
  const user = new User({
    username,
    password,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao salvar usuário", error });
  }
});


// Exemplo de rota de autenticação
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Cleberton" && password === "1234") {
    res.json({ mensagem: "Login bem-sucedido!" });
  } else {
    res.status(401).json({ mensagem: "Credenciais inválidas" });
  }
});

module.exports = router;
