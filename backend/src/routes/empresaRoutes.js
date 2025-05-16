import express from 'express';
import { verifyToken, checkUserType } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/dados', verifyToken, checkUserType(['empresa']), async (req, res) => {
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
    console.error('Erro ao buscar dados da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados da empresa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/coletores-disponiveis', verifyToken, checkUserType(['empresa']), async (req, res) => {
  try {
    const coletores = await User.find({
      tipoUsuario: 'coletor',
      endereco: req.user.endereco
    }).select('nome email telefone veiculo capacidadeColeta');

    res.json({ success: true, data: coletores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar coletores' });
  }
});

router.put('/atualizar', verifyToken, checkUserType(['empresa']), async (req, res) => {
  try {
    const updates = req.body;
    const empresa = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select('-senha -__v');

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: empresa
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar dados', error: error.message });
  }
});

router.get('/publicas', async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa' })
      .select('nome email endereco cnpj razaoSocial telefone')
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
});
export default router;
