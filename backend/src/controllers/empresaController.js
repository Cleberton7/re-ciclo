

export const getEmpresasParceiras = async (req, res) => {
  try {
    // Adicionar paginação e filtros
    const { page = 1, limit = 10 } = req.query;
    const empresas = await Empresa.find()
      .limit(Number(limit)) // Garantindo que o limite seja um número
      .skip((Number(page) - 1) * Number(limit)) // Garantindo que a página seja um número
      .select('-__v');

    const total = await Empresa.countDocuments();

    res.json({
      success: true,
      count: empresas.length,
      total,
      pages: Math.ceil(total / limit),
      data: empresas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar empresas",
      error: error.message
    });
  }
};


export const getDadosEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findOne({ _id: req.user.id }).select('-__v -createdAt -updatedAt -senha');

    if (!empresa) {
      return res.status(404).json({ success: false, message: "Empresa não encontrada" });
    }

    res.json(empresa); // retorna diretamente o objeto empresa
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar dados da empresa", error: error.message });
  }
};

// Atualize o export default
export default {
  getEmpresasParceiras,
  getDadosEmpresa
};
