const User = require("../models/User");

const getUserDetails = async (req, res) => {
  try {
    // Pega os dados do usuário logado
    const userId = req.userId;  // O ID do usuário será extraído do token (verifique no authMiddleware)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna os dados do usuário (sem a senha)
    const { senha, ...userDetails } = user._doc;
    res.status(200).json(userDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar dados do usuário" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { nome, endereco, nomeFantasia, cnpj } = req.body;

    const user = await User.findByIdAndUpdate(userId, {
      nome,
      endereco,
      nomeFantasia,
      cnpj
    }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const { senha, ...updatedUser } = user._doc;
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar dados do usuário" });
  }
};

module.exports = { getUserDetails, updateUserDetails };
