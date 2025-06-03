import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Tipos de mídia permitidos com suas extensões
const MEDIA_TYPES = {
  IMAGE: {
    mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  DOCUMENT: {
    mimes: ['application/pdf'],
    extensions: ['.pdf']
  }
};

// Configuração de storage dinâmica
const createStorage = (subfolder = 'generic') => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads', subfolder);
      
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
      cb(null, uniqueName);
    }
  });
};

// Filtro de arquivos dinâmico
const createFileFilter = (allowedTypes = ['IMAGE']) => {
  return (req, file, cb) => {
    const allowedMimes = [];
    const allowedExtensions = [];
    
    allowedTypes.forEach(type => {
      if (MEDIA_TYPES[type]) {
        allowedMimes.push(...MEDIA_TYPES[type].mimes);
        allowedExtensions.push(...MEDIA_TYPES[type].extensions);
      }
    });
    
    const isValidMime = allowedMimes.includes(file.mimetype);
    const isValidExt = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase()
    );
    
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Middleware de upload configurável
export const createUploader = ({
  subfolder = 'generic',
  fieldName = 'file',
  allowedTypes = ['IMAGE'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1
} = {}) => {
  const upload = multer({
    storage: createStorage(subfolder),
    fileFilter: createFileFilter(allowedTypes),
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    }
  });
  
  // Retorna o middleware configurado
  if (maxFiles > 1) {
    return upload.array(fieldName, maxFiles);
  }
  return upload.single(fieldName);
};

// Middleware de tratamento de erros
export const uploadErrorHandler = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: err.code === 'LIMIT_FILE_SIZE' 
          ? 'Arquivo muito grande' 
          : 'Erro no upload do arquivo'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};


export default createUploader();