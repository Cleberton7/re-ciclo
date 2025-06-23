import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { 
  JWT_SECRET,
  NODE_ENV
} from '../config/config.js';

/**
 * Middleware para verificar e decodificar tokens JWT
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  // Verifica o formato do header
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      code: 'MISSING_TOKEN',
      message: "Token de acesso não fornecido ou formato inválido",
      action: "Inclua um token no formato 'Bearer {token}' no cabeçalho Authorization"
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Busca o usuário no banco para verificar se ainda existe
    const user = await User.findById(decoded.id).select('-senha');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: "Usuário associado ao token não existe mais"
      });
    }

    // Verifica se o e-mail foi verificado
    if (!user.emailVerificado && req.path !== '/verificar-email') {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: "E-mail não verificado",
        action: "Verifique sua caixa de entrada e complete o processo de verificação"
      });
    }

    // Adiciona o usuário à requisição
    req.user = {
      id: user._id,
      tipoUsuario: user.tipoUsuario,
      email: user.email,
      emailVerificado: user.emailVerificado
    };
    
    next();
  } catch (error) {
    let response = {
      success: false,
      message: "Falha na autenticação"
    };
    
    // Tratamento específico para cada tipo de erro
    switch (error.name) {
      case 'TokenExpiredError':
        response = {
          ...response,
          code: 'TOKEN_EXPIRED',
          message: "Token expirado",
          expiredAt: error.expiredAt,
          action: "Renove seu token fazendo login novamente"
        };
        break;
        
      case 'JsonWebTokenError':
        response = {
          ...response,
          code: 'INVALID_TOKEN',
          message: "Token inválido",
          details: NODE_ENV === 'development' ? error.message : undefined
        };
        break;
        
      default:
        response = {
          ...response,
          code: 'AUTH_ERROR',
          details: NODE_ENV === 'development' ? error.message : undefined
        };
    }
    
    res.status(401).json(response);
  }
};

/**
 * Middleware para verificar se o usuário está autenticado
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHENTICATED',
      message: "Acesso não autorizado",
      action: "Faça login para acessar este recurso"
    });
  }
  next();
};

/**
 * Factory para criar middlewares de verificação de tipo de usuário
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.tipoUsuario) {
      return res.status(403).json({
        success: false,
        code: 'ROLE_NOT_IDENTIFIED',
        message: "Tipo de usuário não identificado",
        action: "Verifique seu token de acesso"
      });
    }

    if (!allowedRoles.includes(req.user.tipoUsuario)) {
      return res.status(403).json({
        success: false,
        code: 'UNAUTHORIZED_ROLE',
        message: `Acesso restrito a: ${allowedRoles.join(', ')}`,
        yourRole: req.user.tipoUsuario,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user.emailVerificado) {
    return res.status(403).json({
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: "E-mail não verificado",
      action: "Verifique sua caixa de entrada para completar o cadastro"
    });
  }
  next();
};

// Middlewares específicos pré-definidos
export const requireAdmin = requireRole(['adminGeral']);
export const requireCollector = requireRole(['centro']);
export const requireCompany = requireRole(['empresa']);
export const requireVerifiedUser = [verifyToken, requireAuth];