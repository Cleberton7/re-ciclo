import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

export const verifyToken = (req, res, next) => {

  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    return res.status(401).json({ 
      success: false, 
      message: "Token não fornecido ou formato inválido" 
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expirado",
        expiredAt: error.expiredAt 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Token inválido",
      error: error.message 
    });
  }
};

export const requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Usuário não autenticado' 
    });
  }
  next();
};

export const checkUserType = (tiposPermitidos) => (req, res, next) => {
  
  if (!req.user || !req.user.tipoUsuario) {
    return res.status(403).json({
      success: false,
      message: 'Tipo de usuário não identificado'
    });
  }

  if (!tiposPermitidos.includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      success: false,
      message: `Acesso permitido apenas para: ${tiposPermitidos.join(', ')}`,
      userType: req.user.tipoUsuario
    });
  }

  next();
};

// Funções específicas para tipos de usuário
export const verificarAdmGeral = checkUserType(['admGeral']);
export const verificarColetor = checkUserType(['coletor']);
export const verificarEmpresa = checkUserType(['empresa']);