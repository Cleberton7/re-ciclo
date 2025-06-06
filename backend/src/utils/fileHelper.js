export const getImagePath = (req, filename) => {
  if (!filename) return null;
  return `/uploads/${req.uploadType}/${filename.replace(/^\/+/, '')}`;
};

export const getFullImageUrl = (req, path) => {
  if (!path) return null;
  return path.startsWith('http') 
    ? path 
    : `${req.protocol}://${req.get('host')}${path}`;
};