import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/pessoal', verifyToken, userController.getPersonalData);
router.get('/dados', verifyToken, userController.getUserData);
router.put('/dados', verifyToken, userController.updateUserData);
router.put('/localizacao', verifyToken, userController.updateLocation);
export default router;
