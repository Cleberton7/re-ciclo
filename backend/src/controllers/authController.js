const login = (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@email.com" && password === "123456") {
        res.json({ message: "Login bem-sucedido!", token: "fake-jwt-token" });
    } else {
        res.status(401).json({ error: "Credenciais inválidas!" });
    }
};

const register = (req, res) => {
    res.json({ message: "Usuário registrado com sucesso!" });
};

module.exports = { login, register };
