// src/config/multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração base do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pasta base para uploads
    const baseDir = 'uploads/';
    
    // Subpasta baseada no tipo de upload (noticias, coletas, etc)
    const subfolder = req.uploadType || 'generic';
    const uploadDir = path.join(baseDir, subfolder);
    
    // Cria diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeArquivo = `${Date.now()}${ext}`;
    cb(null, nomeArquivo);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens são permitidas.'), false);
  }
};

// Configuração do multer
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware configurável
export const configureUpload = (uploadType) => {
  return (req, res, next) => {
    req.uploadType = uploadType; // Define o tipo de upload
    next();
  };
};

export default upload;