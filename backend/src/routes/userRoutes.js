const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

/**
 * @route GET /usuario/dados
 * @group Usuários - Operações relacionadas a usuários
 * @returns {object} 200 - Dados do usuário
 * @returns {Error} 401 - Não autorizado
 * @returns {Error} 403 - Acesso negado
 * @returns {Error} 404 - Usuário não encontrado
 * @security Bearer
 */
router.get("/dados", authMiddleware.verifyToken, userController.getUserData);

/**
 * @route PUT /usuario/dados
 * @group Usuários
 * @param {object} body - Dados do usuário para atualização
 * @returns {object} 200 - Dados atualizados com sucesso
 * @returns {Error} 400 - Dados inválidos
 * @returns {Error} 401 - Não autorizado
 * @returns {Error} 403 - Acesso negado
 * @security Bearer
 */
router.put("/dados", authMiddleware.verifyToken, userController.updateUserData);

/**
 * @route GET /usuario/pessoal
 * @group Usuários
 * @description Rota específica para dados de usuários do tipo pessoa
 * @returns {object} 200 - Dados pessoais do usuário
 * @returns {Error} 401 - Não autorizado
 * @returns {Error} 403 - Acesso negado para este tipo de usuário
 * @returns {Error} 404 - Dados não encontrados
 * @security Bearer
 */
router.get("/pessoal", authMiddleware.verifyToken, async (req, res) => {
  try {
    // Define o tipo como pessoa e delega para o controller principal
    req.query.tipo = "pessoa";
    return await userController.getUserData(req, res);
  } catch (error) {
    console.error("Erro na rota /pessoal:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar requisição",
      error: error.message
    });
  }
});

// Rota de saúde para verificar se o endpoint está funcionando
router.get("/health-check", (req, res) => {
  res.json({
    status: "healthy",
    message: "User routes are working",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;