
const User = require('../models/User');

// Buscar todos os centros de coleta
const getEmpresasParceiras = async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'empresa' });
    res.json(centros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmpresasParceiras
};
