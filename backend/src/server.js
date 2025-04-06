const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");  // Importando a função de conexão com o DB

const app = express();
const PORT = 5000;

// Conectar ao banco de dados
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.get("/teste", (req, res) => {
  res.json({ mensagem: "Rota de teste funcionando!" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
