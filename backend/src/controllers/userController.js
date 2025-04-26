const User = require("../models/User");

exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-senha");
    
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    // Filtro por tipo se especificado na query
    if (req.query.tipo && user.tipoUsuario !== req.query.tipo) {
      return res.status(403).json({ message: "Acesso não permitido para este tipo de usuário" });
    }

    let responseData = {
      id: user._id,
      email: user.email,
      tipoUsuario: user.tipoUsuario
    };

    // Dados específicos por tipo
    switch (user.tipoUsuario) {
      case "empresa":
        responseData = {
          ...responseData,
          nome: user.nomeFantasia || user.nome,
          documento: user.cnpj,
          endereco: user.endereco,
          tipoEmpresa: user.tipoEmpresa
        };
        break;
      
      case "coletor":
        responseData = {
          ...responseData,
          nome: user.nome,
          documento: user.cpf,
          veiculo: user.veiculo,
          capacidadeColeta: user.capacidadeColeta
        };
        break;
      
      default: // Pessoa física
        responseData = {
          ...responseData,
          nome: user.nome,
          documento: user.cpf,
          endereco: user.endereco
        };
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar dados",
      error: error.message 
    });
  }
};

exports.updateUserData = async (req, res) => {
  try {
    const { nome, email, endereco, cpf, veiculo, capacidadeColeta, nomeFantasia, cnpj, tipoEmpresa } = req.body;
    const updateFields = {};

    // Campos comuns a todos os usuários
    if (nome) updateFields.nome = nome;
    if (email) updateFields.email = email;
    if (endereco) updateFields.endereco = endereco;

    // Verifica o tipo de usuário
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ 
      success: false,
      message: "Usuário não encontrado" 
    });

    // Atualiza campos específicos por tipo
    switch(user.tipoUsuario) {
      case "empresa":
        if (nomeFantasia) updateFields.nomeFantasia = nomeFantasia;
        if (cnpj) updateFields.cnpj = cnpj;
        if (tipoEmpresa) updateFields.tipoEmpresa = tipoEmpresa;
        break;
      
      case "coletor":
        if (veiculo) updateFields.veiculo = veiculo;
        if (capacidadeColeta) updateFields.capacidadeColeta = capacidadeColeta;
        if (cpf) updateFields.cpf = cpf;
        break;
      
      default: // Pessoa física
        if (cpf) updateFields.cpf = cpf;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { 
        new: true,
        runValidators: true 
      }
    ).select("-senha");

    res.json({
      success: true,
      message: "Dados atualizados com sucesso!",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erro ao atualizar dados do usuário",
      error: error.message,
      details: error.errors // Mostra erros de validação se existirem
    });
  }
};

// Nova função específica para dados pessoais
exports.getPersonalData = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
      tipoUsuario: "pessoa"
    }).select("-senha");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Dados pessoais não encontrados" 
      });
    }

    const responseData = {
      id: user._id,
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      endereco: user.endereco,
      tipoUsuario: user.tipoUsuario
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar dados pessoais",
      error: error.message 
    });
  }
};