import dotenv from 'dotenv';
dotenv.config();

// Configurações básicas do servidor
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const BASE_URL = process.env.BASE_URL || 
                       process.env.RAILWAY_PUBLIC_DOMAIN || 
                       (NODE_ENV === 'production' 
                         ? 'https://re-cicle-production.up.railway.app' 
                         : `http://localhost:${PORT}`);

export const API_URL = `${BASE_URL}/api`;

// Banco de dados
export const MONGO_URI = process.env.MONGO_URI || 
                        process.env.MONGODB_URI || 
                        process.env.DATABASE_URL ||
                        'mongodb://localhost:27017/re-cicle';

// Autenticação JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aleatoria_aqui';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const JWT_EMAIL_EXPIRES_IN = process.env.JWT_EMAIL_EXPIRES_IN || '1h';

// Configurações de e-mail (Nodemailer)
export const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail', // Pode ser gmail, outlook, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

export const EMAIL_FROM = process.env.EMAIL_FROM || 
  `"Re-ciclo" <${process.env.EMAIL_USER}>`;

export const TEAM_EMAIL = process.env.TEAM_EMAIL || process.env.EMAIL_USER;

// Frontend e URLs
export const FRONTEND_URL = process.env.FRONTEND_URL || 
                          'https://re-cicle-git-main-clebertons-projects.vercel.app';

// reCAPTCHA
export const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  contact: {
    max: parseInt(process.env.CONTACT_LIMIT) || 5,
    windowMinutes: parseInt(process.env.CONTACT_WINDOW) || 15
  },
  sensitive: {
    max: parseInt(process.env.SENSITIVE_LIMIT) || 15,
    windowMinutes: parseInt(process.env.SENSITIVE_WINDOW) || 15
  },
  api: {
    max: parseInt(process.env.API_LIMIT) || 100,
    windowMinutes: parseInt(process.env.API_WINDOW) || 15
  }
};

// Validação das variáveis críticas
const requiredConfigs = [
  'MONGO_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'RECAPTCHA_SITE_KEY',
  'RECAPTCHA_SECRET_KEY'
];

requiredConfigs.forEach(config => {
  if (!process.env[config]) {
    throw new Error(`❌ Variável de ambiente crítica faltando: ${config}`);
  }
});

// Exporta tudo
export default {
  PORT,
  BASE_URL,
  API_URL,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_EMAIL_EXPIRES_IN,
  EMAIL_CONFIG,
  EMAIL_FROM,
  TEAM_EMAIL,
  FRONTEND_URL,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY,
  RATE_LIMIT_CONFIG
};
