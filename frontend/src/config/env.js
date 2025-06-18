export const config = {
  API_URL: import.meta.env.VITE_API_URL,
  MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  MAP_ID: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
};

console.log('⚙️ Configurações:', config);
