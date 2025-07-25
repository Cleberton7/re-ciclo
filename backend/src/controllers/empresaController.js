import User from '../models/User.js';

// 🔹 Buscar dados da empresa logada
export const getDadosEmpresa = async (req, res) => {
  try {
    const empresa = await User.findById(req.user.id).select('-senha -__v -createdAt -updatedAt');
    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }
    res.json({
      success: true,
      data: {
        ...empresa._doc,
        nomeFantasia: empresa.razaoSocial || empresa.nome,
        documento: empresa.documento
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados da empresa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔹 Buscar coletores disponíveis
export const getColetoresDisponiveis = async (req, res) => {
  try {
    const coletores = await User.find({
      tipoUsuario: 'centro',
      endereco: req.user.endereco
    }).select('nome email telefone ');
    res.json({ success: true, data: coletores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar coletores' });
  }
};

// 🔹 Atualizar localização da empresa
export const atualizarLocalizacao = async (req, res) => {
  try {
    const { lat, lng } = req.body.localizacao;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: "Latitude e longitude são obrigatórios e devem ser números" });
    }

    await User.findByIdAndUpdate(req.user.id, { localizacao: { lat, lng } });
    res.json({ message: "Localização atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar localização" });
  }
};

// 🔹 Buscar localizações públicas das empresas
export const getLocalizacoes = async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa', localizacao: { $ne: null } })
      .select('nome localizacao');
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar localizações das empresas" });
  }
};

// 🔹 Buscar dados públicos das empresas
export const getEmpresasPublicas = async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa' })
      .select('nome email endereco cnpj razaoSocial telefone imagemPerfil localizacao recebeResiduoComunidade')
      .lean();
    res.json({
      success: true,
      data: empresas.map(e => ({
        ...e,
        nomeFantasia: e.razaoSocial || e.nome
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar empresas'
    });
  }
};

// 🔹 Atualizar dados da empresa (com ou sem imagem)
export const atualizarDados = async (req, res) => {
  try {
    const updates = req.body;

    if (req.file) {
      updates.imagemPerfil = `/uploads/empresas/${req.file.filename}`;
    }

    const empresa = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-senha -__v');

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: empresa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar dados',
      error: error.message
    });
  }
};

