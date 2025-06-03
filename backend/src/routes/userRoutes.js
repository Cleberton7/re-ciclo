import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import userController from '../controllers/userController.js';
import { createUploader, uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

// Configuração do upload de imagem de perfil
const uploadProfileImage = createUploader({
  subfolder: 'users/profiles',
  fieldName: 'imagemPerfil',
  allowedTypes: ['IMAGE'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});

// Rotas do usuário
router.get('/pessoal', verifyToken, userController.getPersonalData);
router.put('/localizacao', verifyToken, userController.updateLocation);
router.put(
  '/dados',
  verifyToken,
  uploadProfileImage,
  uploadErrorHandler,
  userController.updateUserData
);

export default router;