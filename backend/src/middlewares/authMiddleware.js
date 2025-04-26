const jwt = require('jsonwebtoken');

// Middleware de verificação do token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];  // "Bearer <token>" → "<token>"
    if (!token) return res.status(401).json({ message: "Token não fornecido" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Usando a chave secreta do .env
        req.userId = decoded.id;  // Armazena o ID do usuário no req para ser usado nos controladores
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
};

module.exports = { verifyToken };
