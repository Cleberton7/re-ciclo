import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Definição dos tipos de mídia suportados
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

// Configuração de storage melhorada
const createStorage = (subfolder = 'generic') => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadDir = path.join(__dirname, '../../uploads', subfolder);
        
        // Verifica se o diretório existe, se não, cria
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Verifica permissões de escrita
        await fs.access(uploadDir, fs.constants.W_OK);
        
        cb(null, uploadDir);
      } catch (error) {
        cb(new Error(`Erro ao configurar diretório de upload: ${error.message}`));
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
      cb(null, uniqueName);
    }
  });
};

// Filtro de arquivos mais robusto
const createFileFilter = (allowedTypes = ['IMAGE']) => {
  return (req, file, cb) => {
    try {
      const allowedMimes = [];
      const allowedExtensions = [];
      
      allowedTypes.forEach(type => {
        if (MEDIA_TYPES[type]) {
          allowedMimes.push(...MEDIA_TYPES[type].mimes);
          allowedExtensions.push(...MEDIA_TYPES[type].extensions);
        }
      });
      
      const ext = path.extname(file.originalname).toLowerCase();
      const isValidMime = allowedMimes.includes(file.mimetype);
      const isValidExt = allowedExtensions.includes(ext);
      
      if (!isValidMime || !isValidExt) {
        return cb(new Error(`Tipo de arquivo não permitido (${file.mimetype}${ext}). Tipos aceitos: ${allowedTypes.join(', ')}`));
      }
      
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  };
};

// Criação do uploader principal
const createUploader = (options = {}) => {
  const {
    subfolder = 'generic',
    fieldName = 'file',
    allowedTypes = ['IMAGE'],
    maxFileSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 1
  } = options;

  // Configuração do multer
  const upload = multer({
    storage: createStorage(subfolder),
    fileFilter: createFileFilter(allowedTypes),
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    }
  });

  // Middleware principal
  const middleware = (req, res, next) => {
    const uploadHandler = maxFiles > 1 
      ? upload.array(fieldName, maxFiles)
      : upload.single(fieldName);

    uploadHandler(req, res, (err) => {
      if (err) {
        // Tratamento específico para limites de tamanho
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            error: `Arquivo muito grande. Tamanho máximo: ${maxFileSize / (1024 * 1024)}MB`
          });
        }
        
        // Outros erros de upload
        return res.status(400).json({
          success: false,
          error: err.message || 'Erro no upload do arquivo'
        });
      }
      
      // Adiciona informações do upload ao request
      req.uploadInfo = {
        type: subfolder,
        field: fieldName,
        files: req.files || (req.file ? [req.file] : [])
      };
      
      next();
    });
  };

  // Anexa a instância do multer para uso externo se necessário
  middleware.upload = upload;
  
  return middleware;
};

export default createUploader;

// Middleware de tratamento de erros específico para uploads
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Erro no upload: ${err.message}`
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${err.message}`
    });
  }
  next();
};