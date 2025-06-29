import rateLimit from 'express-rate-limit';
import { NODE_ENV, RATE_LIMIT_CONFIG } from '../config/config.js';
import { createClient } from 'redis';
import RedisStore from 'rate-limit-redis';

// Configuração do Redis (se disponível)
let redisClient;
let store;

if (process.env.REDIS_URL && NODE_ENV !== 'test') {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
    }
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));

  store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rate_limit:'
  });

  // Conecta ao Redis
  if (!redisClient.isOpen) {
    redisClient.connect().catch(err => {
      console.error('Falha ao conectar ao Redis:', err);
    });
  }
}

// Função genérica para criar qualquer rate limiter
export const createRateLimiter = ({
  max = 100,
  windowMinutes = 15,
  scope = 'ip',
  name = 'generic'
}) => {
  const keyGenerator = (req) => {
    if (scope === 'user' && req.user?.id) {
      return `user:${req.user.id}:${name}`;
    }
    if (scope === 'global') {
      return `global:${name}`;
    }
    return `ip:${req.ip}:${name}`;
  };

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message: {
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: `Limite de taxa excedido. Máximo ${max} requisições a cada ${windowMinutes} minutos.`,
      retryAfter: `${windowMinutes} minutos`,
      docs: 'https://api.recicle.com/docs/rate-limiting'
    },
    keyGenerator,
    store,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
      return NODE_ENV === 'test' || whitelist.includes(req.ip);
    },
    handler: (req, res, next, options) => {
      res.status(429).json({
        ...options.message,
        currentCount: req.rateLimit.current,
        limit: req.rateLimit.limit,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
      });
    }
  });
};

// 🔥 Função simplificada para usar diretamente nas rotas
export const rateLimiter = (max, windowMinutes) => 
  createRateLimiter({ max, windowMinutes, scope: 'ip', name: 'generic' });

// 🎯 Rate limiters pré-configurados
export const contactLimiter = createRateLimiter({
  ...RATE_LIMIT_CONFIG.contact,
  scope: 'ip',
  name: 'contact'
});

export const sensitiveLimiter = createRateLimiter({
  ...RATE_LIMIT_CONFIG.sensitive,
  scope: 'user',
  name: 'sensitive'
});

export const apiLimiter = createRateLimiter({
  ...RATE_LIMIT_CONFIG.api,
  scope: 'ip',
  name: 'api'
});

export const heavyOperationLimiter = createRateLimiter({
  max: 10,
  windowMinutes: 60,
  scope: 'user',
  name: 'heavy_ops'
});

// Exporta tudo junto (opcional)
export default {
  createRateLimiter,
  rateLimiter,
  contactLimiter,
  sensitiveLimiter,
  apiLimiter,
  heavyOperationLimiter
};
