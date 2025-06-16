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

export default router;