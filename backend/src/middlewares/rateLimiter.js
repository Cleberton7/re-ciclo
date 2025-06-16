// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '../config/config.js';

/**
 * Middleware de limitação de taxa (rate limiting)
 * @param {number} maxRequests - Número máximo de requisições
 * @param {number} minutes - Janela de tempo em minutos
 * @returns {Function} Middleware de rate limiting
 */
export const rateLimiter = (maxRequests = 100, minutes = 15) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000, // Janela de tempo em milissegundos
    max: maxRequests, // Limite de requisições por janela
    message: {
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: `Muitas requisições. Por favor, tente novamente após ${minutes} minutos.`
    },
    standardHeaders: true, // Retorna informações de limite nos headers
    legacyHeaders: false, // Desabilita headers legados
    skip: () => NODE_ENV === 'test' // Desativa em ambiente de teste
  });
};

/**
 * Middleware de limitação de taxa para endpoints sensíveis (login, registro, etc.)
 */
export const sensitiveLimiter = rateLimiter(15, 15); // 15 requisições a cada 15 minutos

/**
 * Middleware de limitação de taxa padrão para APIs
 */
export const apiLimiter = rateLimiter(100, 15); // 100 requisições a cada 15 minutos

export default rateLimiter;