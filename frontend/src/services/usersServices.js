import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/usuarios`;

export const getTodosUsuarios = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.data; 
};
