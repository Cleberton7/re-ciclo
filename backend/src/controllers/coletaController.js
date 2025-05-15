import Coleta from '../models/coletaModel.js';

// Busca solicitações de coleta com filtros
export const getSolicitacoes = async (req, res) => {
  try {
    const { material, urgencia, status = 'pendente' } = req.query;

    const filtros = { status };
    if (material) filtros.material = material;
    if (urgencia) filtros.urgencia = urgencia;

    const solicitacoes = await Coleta.find(filtros)
      .populate('empresa', 'nome endereco telefone')
      .select('-__v');

    res.json({
      success: true,
      count: solicitacoes.length,
      data: solicitacoes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar solicitações",
      error: error.message
    });
  }
};

// Aceitar uma coleta (para coletores)
export const aceitarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const coletorId = req.user.id; // ID do coletor logado (do token JWT)

    const coleta = await Coleta.findByIdAndUpdate(
      id,
      { 
        status: 'aceita',
        coletor: coletorId
      },
      { new: true }
    ).populate('empresa', 'nome endereco');

    if (!coleta) {
      return res.status(404).json({
        success: false,
        message: "Solicitação não encontrada"
      });
    }

    res.json({
      success: true,
      message: "Coleta aceita com sucesso!",
      data: coleta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao aceitar coleta",
      error: error.message
    });
  }
};

// Outras funções úteis:
export const criarSolicitacao = async (req, res) => { /* ... */ };
export const atualizarStatus = async (req, res) => { /* ... */ };
export const getColetasPorColetor = async (req, res) => { /* ... */ };