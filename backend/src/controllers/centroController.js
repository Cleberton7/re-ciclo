import User from '../models/User.js';

// 🔹 Buscar dados do centro de reciclagem logado
export const getDadosCentro = async (req, res) => {
  try {
    const centro = await User.findById(req.user.id)
      .select('-senha -__v -createdAt -updatedAt -emailVerificationToken');

    if (!centro) {
      return res.status(404).json({
        success: false,
        code: 'COLETOR_NOT_FOUND',
        message: 'Centro de reciclagem não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...centro._doc,
        nomeCompleto: centro.nome || centro.razaoSocial,
        documento: centro.cnpj || centro.cpf
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro ao buscar dados do centro de reciclagem',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔹 Buscar centros disponíveis no mesmo endereço
export const getCentrosDisponiveis = async (req, res) => {
  try {
    const centros = await User.find({
      tipoUsuario: 'centro',
      endereco: req.user.endereco,
      emailVerificado: true
    }).select('nome email telefone imagemPerfil');

    res.json({ success: true, data: centros });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro ao buscar centros disponíveis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔹 Atualizar localização
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

// 🔹 Buscar centros públicos
export const getCentrosPublicos = async (req, res) => {
  try {
    const centros = await User.find({
      tipoUsuario: 'centro',
    })
      .select('nome email endereco cnpj telefone nomeFantasia imagemPerfil localizacao tiposMateriais')
      .lean();

    res.json({
      success: true,
      data: centros.map(centro => ({
        ...centro,
        tiposMateriais: centro.tiposMateriais || [] // Garante que sempre retorne um array
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro ao buscar centros de reciclagem'
    });
  }
};

// 🔹 Buscar localizações dos centros
export const getLocalizacoes = async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'centro', localizacao: { $ne: null } })
      .select('nome localizacao');

    res.json(centros);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar localizações dos centros de reciclagem" });
  }
};

// 🔹 Atualizar dados do centro (com imagem opcional)
export const atualizarDados = async (req, res) => {
  try {
    const allowedUpdates = ['nome', 'telefone', 'endereco'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    if (req.file) {
      updates.imagemPerfil = `/uploads/centros-reciclagem/${req.file.filename}`;
    }

    const centro = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-senha -__v -emailVerificationToken');

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: centro
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Erro ao atualizar dados',
      details: error.message
    });
  }
};
// 🔹 Buscar empresa pública por ID
export const getCentroPublicoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const centro = await User.findOne({
      _id: id,
      tipoUsuario: 'centro'
    }).select('nome email endereco cnpj nomeFantasia telefone imagemPerfil localizacao tiposMateriais');

    if (!centro) {
      return res.status(404).json({ success: false, message: 'Centro não encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...centro._doc,
        nomeFantasia: centro.nomeFantasia || centro.nome,
        tiposMateriais: centro.tiposMateriais || [] // Garante que sempre retorne um array
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar centro',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
