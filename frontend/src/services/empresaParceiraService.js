import axios from "axios";

const API_URL = "http://localhost:5000/empresas-parceiras"; // Remover o "/api" da URL

export const getEmpresasParceiras = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};