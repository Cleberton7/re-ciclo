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
//import coletorRoutes from './src/routes/coletorRoutes.js'; 
import coletasRoutes from './src/routes/coletasRoutes.js';
import noticiaRoutes from './src/routes/noticiasRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

if (!MONGO_URI.includes('mongodb://') && NODE_ENV === 'production') {
  console.error('❌ String de conexão MongoDB inválida para produção!');
  process.exit(1);
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

async function main() {
  try {
    // Adicione no início da função main()
    console.log('🛠️  Ambiente:', NODE_ENV);
    console.log('🔗 URL Base:', BASE_URL);
    console.log('🗄️  String de conexão encurtada:', MONGO_URI.substring(0, 30) + '...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('🔍 String de conexão MongoDB:', MONGO_URI);
    console.log('🔍 Variáveis de ambiente:', {
      MONGO_URL: process.env.MONGO_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      MONGO_URI: process.env.MONGO_URI
    });
    console.log("✅ Conectado ao MongoDB");
    mongoose.connection.on('connected', () => {
      console.log('✅ Conexão MongoDB estabelecida');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB desconectado!');
    });
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
    //app.use("/api/coletor", coletorRoutes); 
    app.use("/api/coletas", coletasRoutes);
    app.use("/api/noticias", noticiaRoutes);  
    app.use("/api/public", publicRoutes);

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
    // Adicione isto ANTES do app.listen()
    process.on('SIGTERM', () => {
      console.log('🛑 Recebido SIGTERM - Encerrando graciosamente');
      server.close(() => {
        console.log('🚪 Servidor fechado');
        process.exit(0);
      });
    });

    // Modifique o app.listen para capturar o servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  }
}

main();