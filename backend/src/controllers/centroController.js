const User = require('../models/User');

// Buscar todos os centros de coleta
const getCentrosReciclagem = async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'coletor' });
    res.json(centros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCentrosReciclagem
};
