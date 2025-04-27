import axios from 'axios';

const API_URL = 'http://localhost:5000/centros-reciclagem';

export const getCentrosReciclagem = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
