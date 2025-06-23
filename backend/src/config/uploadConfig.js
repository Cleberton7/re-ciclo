// Crie um arquivo uploadConfig.js
import createUploader from './multerConfig.js';

export const coletaUpload = createUploader({
  subfolder: 'coletas',
  fieldName: 'imagem',
  allowedTypes: ['IMAGE'],
  maxFileSize: 10 * 1024 * 1024 // 10MB
});