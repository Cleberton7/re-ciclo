import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT, MONGO_URI, NODE_ENV } from './src/config/config.js';

// Rotas
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import empresaRoutes from './src/routes/empresaRoutes.js';
import centroRoutes from './src/routes/centroRoutes.js';
import coletorRoutes from './src/routes/coletorRoutes.js'; 
import coletasRoutes from './src/routes/coletasRoutes.js';
import noticiaRoutes from './src/routes/noticiasRoutes.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    // Configuração completa do CORS
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Authorization'],
      maxAge: 86400
    }));

    // Middleware para pré-voo OPTIONS
    app.options('*', cors());

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    // Rotas
    app.use("/api/auth", authRoutes);
    app.use("/api/usuarios", userRoutes); 
    app.use("/api/empresas", empresaRoutes);
    app.use("/api/centros-reciclagem", centroRoutes);
    app.use("/api/coletor", coletorRoutes); 
    app.use("/api/coletas", coletasRoutes);
    app.use("/api/noticias", noticiaRoutes);  

    // Middleware de erro
    app.use(errorHandler);

    // Rota de teste
    app.get("/api/teste", (req, res) => {
      res.json({
        success: true,
        mensagem: "API funcionando",
        ambiente: NODE_ENV
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  }
}

main();