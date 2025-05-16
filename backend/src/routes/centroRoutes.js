import express from 'express';
import { verifyToken, checkUserType } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET dados do centro logado
router.get('/dados', verifyToken, checkUserType(['centro']), async (req, res) => {
  try {
    const centro = await User.findById(req.user.id).select('-senha -__v -createdAt -updatedAt');

    if (!centro) {
      return res.status(404).json({ success: false, message: 'Centro não encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...centro._doc,
        nomeFantasia: centro.razaoSocial || centro.nome,
        documento: centro.documento
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do centro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do centro',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET coletores disponíveis para o centro (exemplo de rota específica para centro)
router.get('/coletores-disponiveis', verifyToken, checkUserType(['centro']), async (req, res) => {
  try {
    // Supondo que coletores estejam na mesma área/endereco do centro
    const coletores = await User.find({
      tipoUsuario: 'coletor',
      endereco: req.user.endereco
    }).select('nome email telefone veiculo capacidadeColeta');

    res.json({ success: true, data: coletores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar coletores disponíveis' });
  }
});

// PUT atualizar dados do centro
router.put('/atualizar', verifyToken, checkUserType(['centro']), async (req, res) => {
  try {
    const updates = req.body;
    const centro = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-senha -__v');

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: centro
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar dados', error: error.message });
  }
});

export default router;
