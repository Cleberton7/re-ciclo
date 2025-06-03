
export const getImageUrl = (req, filename) => {
  if (!filename) return null;
  return `/uploads/${req.uploadType}/${filename}`;
};

export const getFullImageUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${req.uploadType}/${filename}`;
};