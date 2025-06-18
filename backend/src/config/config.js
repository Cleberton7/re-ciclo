import dotenv from 'dotenv';
dotenv.config();

// Configurações básicas do servidor
export const PORT = process.env.PORT || 5000;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Banco de dados - Corrigido para usar as variáveis do Railway
// Atualize a configuração do MongoDB para:
export const MONGO_URI = process.env.MONGO_URL || process.env.DATABASE_URL;
// Autenticação JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aleatoria_aqui';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const JWT_EMAIL_EXPIRES_IN = process.env.JWT_EMAIL_EXPIRES_IN || '1h';

// Configurações de e-mail
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'seu_usuario_smtp',
    pass: process.env.EMAIL_PASS || 'sua_senha_smtp'
  }
};

export const EMAIL_FROM = process.env.EMAIL_FROM || 
  `"ReciclaTech" <${process.env.EMAIL_USER || 'no-reply@reciclatech.com'}>`;

// URLs do frontend para links em e-mails
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validação das variáveis críticas
const requiredConfigs = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];

requiredConfigs.forEach(config => {
  if (!process.env[config] && NODE_ENV === 'production') {
    throw new Error(`❌ Variável de ambiente crítica faltando: ${config}`);
  }
});

// Exporta tudo como um objeto único (opcional)
export default {
  PORT,
  BASE_URL,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_EMAIL_EXPIRES_IN,
  EMAIL_CONFIG,
  EMAIL_FROM,
  FRONTEND_URL
};