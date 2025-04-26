require('dotenv').config();  // Carregar variáveis de ambiente

console.log("MONGO_URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");  // Rota de usuário
const connectDB = require("./src/config/db");  // Importando a função de conexão com o DB

const app = express();
const PORT = 5000;

// Conectar ao banco de dados
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Permite apenas esse domínio
}));
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/api/usuario", userRoutes);  // Adicionando a rota de usuário
app.get("/teste", (req, res) => {
  res.json({ mensagem: "Rota de teste funcionando!" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

