export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'https://re-cicle-production.up.railway.app',
  MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  MAP_ID: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
};

console.log('⚙️ Configurações:', config); // Para debug