import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile
} from "../controllers/authController.js";
import { 
  verifyToken, 
  requireAuth 
} from "../middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";
import User from '../models/User.js';

const router = express.Router();

// Configuração de rate limiting para proteção contra brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Limite de 50 requisições por IP
  message: {
    success: false,
    code: "TOO_MANY_REQUESTS",
    message: "Muitas tentativas de acesso. Por favor, tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rotas públicas (com rate limiting)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authLimiter, resendVerificationEmail);
router.post("/request-password-reset", authLimiter, requestPasswordReset);
router.post("/reset-password", authLimiter, resetPassword);

// Rotas protegidas (requerem autenticação)
router.get("/me", verifyToken, requireAuth, getUserProfile);
router.put("/me", verifyToken, requireAuth, updateUserProfile);

// Atualize a rota /verify para:
router.get("/verify", verifyToken, requireAuth, async (req, res) => {
  try {
    // Busca o usuário com todos os campos necessários para o frontend
    const user = await User.findById(req.user.id)
      .select('nome razaoSocial nomeFantasia email tipoUsuario emailVerificado');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado' 
      });
    }

    // Calcula o displayName consistentemente
    const displayName = user.nome || user.razaoSocial || user.nomeFantasia || user.email;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        displayName, // Nome padronizado
        tipoUsuario: user.tipoUsuario,
        email: user.email,
        emailVerificado: user.emailVerificado,
        // Mantém os campos originais para compatibilidade
        nome: displayName
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
export default router;