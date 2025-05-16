import express from 'express';
import { verifyToken, checkUserType } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET dados do coletor logado
router.get('/dados', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    const coletor = await User.findById(req.user.id).select('-senha -__v -createdAt -updatedAt');

    if (!coletor) {
      return res.status(404).json({ success: false, message: 'Coletor não encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...coletor._doc,
        nomeCompleto: coletor.nome || coletor.razaoSocial,
        documento: coletor.documento
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do coletor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do coletor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET centros disponíveis para coleta (exemplo de rota específica para coletor)
router.get('/centros-disponiveis', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    // Supondo que centros tenham tipoUsuario 'centro' e estejam na mesma cidade/área do coletor
    const centros = await User.find({
      tipoUsuario: 'centro',
      endereco: req.user.endereco
    }).select('nome email telefone capacidadeRecepcao');

    res.json({ success: true, data: centros });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar centros disponíveis' });
  }
});

// PUT atualizar dados do coletor
router.put('/atualizar', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    const updates = req.body;
    const coletor = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-senha -__v');

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: coletor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar dados', error: error.message });
  }
});

export default router;
