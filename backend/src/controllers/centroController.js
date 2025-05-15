import User from '../models/centroModel.js';

/**
 * Busca todos os centros de coleta (usuários do tipo coletor)
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @returns {Promise<void>}
 */
export const getCentrosReciclagem = async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'coletor' })
      .select('-senha -__v')  // Remove campos sensíveis
      .lean();  // Retorna objetos JavaScript simples

    res.json({
      success: true,
      count: centros.length,
      data: centros
    });
  } catch (error) {
    console.error('Erro ao buscar centros de reciclagem:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno no servidor',
      error: error.message 
    });
  }
};

export default {
  getCentrosReciclagem
};