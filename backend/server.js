require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Rotas
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const empresaRoutes = require("./src/routes/empresaRoutes"); // ➡️ Nova rota de empresas
const centroRoutes = require("./src/routes/centroRoutes");   // ➡️ Nova rota de centros

const app = express();
const PORT = process.env.PORT || 5000;

// Conexão com o banco de dados
connectDB().then(() => {
  console.log("✅ Conectado ao MongoDB");
}).catch(err => {
  console.error("❌ Falha na conexão com MongoDB:", err);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',  // seu frontend
  credentials: true
}));
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/usuario", userRoutes);

// ➡️ Novas rotas adicionadas
app.use("/empresas-parceiras", empresaRoutes);
app.use("/centros-reciclagem", centroRoutes);

// Rota de teste
app.get("/teste", (req, res) => {
  res.json({ mensagem: "Rota de teste funcionando!" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
