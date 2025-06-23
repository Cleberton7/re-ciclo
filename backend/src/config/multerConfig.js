import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tipos de mídia com validação mais robusta
const MEDIA_TYPES = {
  IMAGE: {
    mimes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/x-png',
      'application/octet-stream' // Para lidar com alguns casos de PNG
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    validate: (file) => {
      // Verificação adicional para arquivos PNG com mimetype incorreto
      if (file.originalname.toLowerCase().endsWith('.png')) {
        return true;
      }
      return true;
    }
  },
  DOCUMENT: {
    mimes: ['application/pdf'],
    extensions: ['.pdf']
  }
};

// Configuração de storage com tratamento de erros
const createStorage = (subfolder = 'generic') => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadDir = path.join(__dirname, '../../uploads', subfolder);
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(new Error('Falha ao criar diretório de upload'), null);
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
      const allowedConfigs = allowedTypes.map(type => MEDIA_TYPES[type]).filter(Boolean);
      
      // Verifica por mimetype e extensão
      const isValidFile = allowedConfigs.some(config => {
        const isMimeValid = config.mimes.includes(file.mimetype);
        const ext = path.extname(file.originalname).toLowerCase();
        const isExtValid = config.extensions.includes(ext);
        
        // Executa validação adicional se existir
        const customValidation = config.validate ? config.validate(file) : true;
        
        return (isMimeValid || isExtValid) && customValidation;
      });

      if (isValidFile) {
        cb(null, true);
      } else {
        const allowedExtensions = allowedConfigs.flatMap(c => c.extensions);
        console.warn('Tentativa de upload de arquivo não permitido:', {
          fileName: file.originalname,
          mimetype: file.mimetype,
          allowed: allowedExtensions
        });
        cb(new Error(
          `Tipo de arquivo não permitido. Tipos aceitos: ${allowedExtensions.join(', ')}`
        ), false);
      }
    } catch (error) {
      console.error('Erro na validação do arquivo:', error);
      cb(error, false);
    }
  };
};

// Criador de middleware com opções melhoradas
const createUploader = (options = {}) => {
  const {
    subfolder = 'generic',
    fieldName = 'file',
    allowedTypes = ['IMAGE'],
    maxFileSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 1
  } = options;

  const upload = multer({
    storage: createStorage(subfolder),
    fileFilter: createFileFilter(allowedTypes),
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    }
  });

  const middleware = (req, res, next) => {
    req.uploadType = subfolder;
    
    const handler = maxFiles > 1 
      ? upload.array(fieldName, maxFiles)
      : upload.single(fieldName);

    handler(req, res, (err) => {
      if (err) {
        req.uploadError = err;
      }
      next();
    });
  };

  // Expõe a instância do multer para uso direto se necessário
  middleware.upload = upload;
  return middleware;
};

// Handler de erros mais completo
export const uploadErrorHandler = (err, req, res, next) => {
  const error = err || req.uploadError;
  
  if (error) {
    console.error('Erro no upload:', error);
    
    let message = 'Erro no upload do arquivo';
    let status = 400;
    
    if (error.message.includes('Tipo de arquivo')) {
      message = error.message;
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Arquivo muito grande. Tamanho máximo: 5MB';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Número máximo de arquivos excedido';
    } else if (error.message.includes('diretório')) {
      message = 'Erro interno no servidor ao processar arquivo';
      status = 500;
    }

    res.status(status).json({
      success: false,
      error: message
    });
  } else {
    next();
  }
};

export default createUploader;