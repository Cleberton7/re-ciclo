// src/utils/fileHelper.js
export const getImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${req.uploadType}/${filename}`;
};