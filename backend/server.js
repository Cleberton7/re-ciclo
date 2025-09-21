import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  PORT, 
  MONGO_URI, 
  NODE_ENV, 
  BASE_URL, 
  FRONTEND_URL 
} from './src/config/config.js';

// Rotas
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import empresaRoutes from './src/routes/empresaRoutes.js';
import centroRoutes from './src/routes/centroRoutes.js';
import coletasRoutes from './src/routes/Coletas/Private/coletasRoutes.js';
import noticiaRoutes from './src/routes/noticiasRoutes.js';
import publicRoutes from './src/routes/Coletas/Public/publicRoutes.js';
import contatoRoutes from './src/routes/contatoRoutes.js';
import publicDataroutes from './src/routes/publicDataRoutes.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 🔥 Corrige problemas de proxy e IP no Railway, Vercel, Render
app.set('trust proxy', 1);

// Validação crítica de variáveis
if (!BASE_URL || !MONGO_URI) {
  console.error('❌ Variáveis críticas não definidas:', { BASE_URL, MONGO_URI });
  process.exit(1);
}
console.log('🟦 MONGO_URI:', MONGO_URI);

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB');
    console.log('🛠️  Configurações:', {
      NODE_ENV,
      BASE_URL,
      FRONTEND_URL,
      MONGO_URI: MONGO_URI.replace(/\/\/[^@]+@/, '//***:***@')
    });

    // 🟦 Configuração de CORS aprimorada
    const allowedOrigins = [
      FRONTEND_URL,
      BASE_URL,
      'http://localhost:5173',
      'https://re-cicle-git-main-clebertons-projects.vercel.app',
      'https://re-cicle.vercel.app'
    ];

    const isVercelPreview = origin => 
      origin && origin.endsWith('.vercel.app');

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || isVercelPreview(origin)) {
          callback(null, true);
        } else {
          console.warn('⚠️ CORS bloqueado para:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400
    }));

    app.options('*', cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 🔗 Arquivos estáticos (imagens)
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // 🌐 Rotas
    app.use("/api/auth", authRoutes);
    app.use("/api/usuarios", userRoutes);
    app.use("/api/empresas", empresaRoutes);
    app.use("/api/centros-reciclagem", centroRoutes);
    app.use("/api/coletas", coletasRoutes);
    app.use("/api/noticias", noticiaRoutes);
    app.use("/api/public", publicRoutes);
    app.use("/api/public-routes", publicDataroutes);
    app.use('/api', contatoRoutes);

    // 🔥 Health Check
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'healthy' });
    });

    // 🔥 Configuração pública
    app.get('/api/config', (req, res) => {
      res.json({
        nodeEnv: NODE_ENV,
        baseUrl: BASE_URL,
        frontendUrl: FRONTEND_URL,
        corsAllowed: allowedOrigins
      });
    });

    // 🛑 Middleware de erros
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em ${BASE_URL}`);
      console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    });

  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  }
}

main();
