
import User from '../models/User.js';
// 🔹 Buscar dados públicos das empresas
export const getEmpresasPublicas = async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa' })
      .select('nome email endereco cnpj razaoSocial telefone imagemPerfil localizacao recebeResiduoComunidade tiposMateriais')
      .lean();
    
    res.json({
      success: true,
      data: empresas.map(e => ({
        ...e,
        nomeFantasia: e.razaoSocial || e.nome,
        tiposMateriais: e.tiposMateriais || [] // Garante que sempre retorne um array
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar empresas'
    });
  }
};
// 🔹 Buscar empresa pública por ID
export const getEmpresaPublicaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await User.findOne({
      _id: id,
      tipoUsuario: 'empresa'
    }).select('nome email endereco cnpj razaoSocial telefone imagemPerfil localizacao recebeResiduoComunidade tiposMateriais');

    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }

    res.json({
      success: true,
      data: {
        ...empresa._doc,
        nomeFantasia: empresa.razaoSocial || empresa.nome,
        tiposMateriais: empresa.tiposMateriais || [] // Garante que sempre retorne um array
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar empresa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// 🔹 Buscar localizações públicas das empresas
export const getLocalizacoesEmpresas = async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa', localizacao: { $ne: null } })
      .select('nome localizacao');
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar localizações das empresas" });
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
export const getLocalizacoesCentros = async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'centro', localizacao: { $ne: null } })
      .select('nome localizacao');

    res.json(centros);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar localizações dos centros de reciclagem" });
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

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  return distancia;
};

// 🔹 Buscar empresas por proximidade
export const getEmpresasPorProximidade = async (req, res) => {
  try {
    const { lat, lng, raio } = req.query;
    
 
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas de latitude e longitude são obrigatórias'
      });
    }

    const raioMetros = raio ? parseInt(raio) : 10000;

    const query = {
      tipoUsuario: 'empresa',
      localizacao: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: raioMetros
        }
      }
    };

    const empresas = await User.find(query)
    .select('nome email endereco cnpj razaoSocial telefone imagemPerfil localizacao recebeResiduoComunidade tiposMateriais')
    .lean();

    // Calcular distância para cada empresa
    const empresasComDistancia = empresas.map(empresa => {
      const longitude = empresa.localizacao.coordinates[0];
      const latitude = empresa.localizacao.coordinates[1];
      
      const distancia = calcularDistancia(
        parseFloat(lat),
        parseFloat(lng),
        latitude,
        longitude
      );
      
      return {
        ...empresa,
        localizacao: {
          lat: latitude,
          lng: longitude
        },
        nomeFantasia: empresa.razaoSocial || empresa.nome,
        tiposMateriais: empresa.tiposMateriais || [],
        distancia: Math.round(distancia)
      };
    });

    res.json({
      success: true,
      data: empresasComDistancia
    });
  } catch (error) {
    console.error('❌ [ERROR] Erro ao buscar empresas por proximidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar empresas'
    });
  }
};

// 🔹 Buscar centros por proximidade
export const getCentrosPorProximidade = async (req, res) => {
  try {
    const { lat, lng, raio } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas de latitude e longitude são obrigatórias'
      });
    }

    const raioMetros = raio ? parseInt(raio) : 10000;

    const centros = await User.find({
      tipoUsuario: 'centro',
      localizacao: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: raioMetros
        }
      }
    })
    .select('nome email endereco cnpj telefone nomeFantasia imagemPerfil localizacao tiposMateriais')
    .lean();


    // Calcular distância para cada centro
    const centrosComDistancia = centros.map(centro => {
      const longitude = centro.localizacao.coordinates[0];
      const latitude = centro.localizacao.coordinates[1];
      
      const distancia = calcularDistancia(
        parseFloat(lat),
        parseFloat(lng),
        latitude,
        longitude
      );
      
      return {
        ...centro,
        localizacao: {
          lat: latitude,
          lng: longitude
        },
        tiposMateriais: centro.tiposMateriais || [],
        distancia: Math.round(distancia)
      };
    });

    res.json({
      success: true,
      data: centrosComDistancia
    });
  } catch (error) {
    console.error('❌ [ERROR] Erro detalhado ao buscar centros:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar centros de reciclagem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};