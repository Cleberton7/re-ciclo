const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware"); // Middleware para verificar o JWT

const router = express.Router();

// Rotas de usuário
router.get("/pessoal", authMiddleware.verifyToken, userController.getUserDetails);
router.put("/pessoal", authMiddleware.verifyToken, userController.updateUserDetails);

module.exports = router;
