import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MEDIA_TYPES = {
  IMAGE: {
    mimes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/x-png' // Adicione este tipo comum para PNG
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  DOCUMENT: {
    mimes: ['application/pdf'],
    extensions: ['.pdf']
  }
};

const createStorage = (subfolder = 'generic') => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads', subfolder);
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
      cb(null, uniqueName);
    }
  });
};

// Modifique a função createFileFilter para debug
const createFileFilter = (allowedTypes = ['IMAGE']) => {
  return (req, file, cb) => {
    console.log('Arquivo recebido:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    const allowedMimes = allowedTypes.flatMap(type => 
      MEDIA_TYPES[type]?.mimes || []
    );

    const fileExt = path.extname(file.originalname).toLowerCase();
    const isValidMime = allowedMimes.includes(file.mimetype);
    const isValidExt = MEDIA_TYPES.IMAGE.extensions.includes(fileExt);

    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      console.error('Tipo de arquivo rejeitado:', {
        mimetype: file.mimetype,
        extensão: fileExt,
        permitidos: allowedMimes
      });
      cb(new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedMimes.join(', ')}`), false);
    }
  };
};

const createUploader = ({
  subfolder = 'generic',
  fieldName = 'file',
  allowedTypes = ['IMAGE'],
  maxFileSize = 5 * 1024 * 1024,
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

  const middleware = (req, res, next) => {
    req.uploadType = subfolder;
    if (maxFiles > 1) {
      upload.array(fieldName, maxFiles)(req, res, next);
    } else {
      upload.single(fieldName)(req, res, next);
    }
  };

  middleware.upload = upload;
  return middleware;
};

export default createUploader;

export const uploadErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(400).json({
      success: false,
      error: err.message.includes('Tipo de arquivo') 
        ? err.message 
        : 'Erro no upload do arquivo'
    });
  } else {
    next();
  }
};