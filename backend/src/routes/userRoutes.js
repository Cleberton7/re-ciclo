import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import userController from '../controllers/userController.js';
import upload, { configureUpload} from '../config/multerConfig.js';
const router = express.Router();

router.get('/pessoal', verifyToken, userController.getPersonalData);
router.put('/localizacao', verifyToken, userController.updateLocation);
router.put(
  '/dados',
  verifyToken,
  configureUpload('users'),
  upload.single('imagemPerfil'),
  userController.updateUserData
);

export default router;
