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

// Configurações de e-mail (com fallback para SendGrid)
export const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid'; // ou 'nodemailer'
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT) || 2525,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'recicletucurui@gmail.com',
    pass: process.env.EMAIL_PASS || 'hizn mxib unas ihrc'
  }
};

export const EMAIL_FROM = process.env.EMAIL_FROM || 
  `"Recicle" <${process.env.EMAIL_USER || 'no-reply@reciclatech.com'}>`;

export const TEAM_EMAIL = process.env.TEAM_EMAIL || 'equipe@reciclatech.com';

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

// Validação das variáveis críticas por ambiente
const productionConfigs = ['MONGO_URI', 'JWT_SECRET'];
const developmentConfigs = [...productionConfigs, 'RECAPTCHA_SITE_KEY', 'RECAPTCHA_SECRET_KEY'];

const validateConfig = (requiredConfigs) => {
  requiredConfigs.forEach(config => {
    if (!process.env[config]) {
      throw new Error(`❌ Variável de ambiente crítica faltando: ${config}`);
    }
  });
};

if (NODE_ENV === 'production') {
  validateConfig(productionConfigs);
  
  if (EMAIL_PROVIDER === 'sendgrid' && !SENDGRID_API_KEY) {
    throw new Error('❌ SENDGRID_API_KEY é obrigatório em produção');
  }
} else {
  validateConfig(developmentConfigs);
}

// Exporta tudo como um objeto único (opcional)
export default {
  PORT,
  BASE_URL,
  API_URL,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_EMAIL_EXPIRES_IN,
  EMAIL_PROVIDER,
  SENDGRID_API_KEY,
  EMAIL_CONFIG,
  EMAIL_FROM,
  TEAM_EMAIL,
  FRONTEND_URL,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY,
  RATE_LIMIT_CONFIG
};