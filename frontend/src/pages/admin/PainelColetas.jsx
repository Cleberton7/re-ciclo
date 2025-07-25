import React, { useEffect, useState } from "react";
import { getDadosPublicosColetas, concluirColeta } from "../../services/publicColetasService";
import { ClipLoader } from "react-spinners";

const PainelColetas = () => {
  const [coletas, setColetas] = useState([]);
  const [filtros, setFiltros] = useState({ status: "", tipoMaterial: "", solicitante: "" });
  const [loading, setLoading] = useState(true);

  const buscarColetas = async () => {
    setLoading(true);
    try {
      const data = await getDadosPublicosColetas();
      setColetas(data);
    } catch (error) {
      console.error("Erro ao buscar coletas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleConcluir = async (id) => {
    try {
      await concluirColeta(id);
      buscarColetas(); // Atualiza
    } catch (error) {
      console.error("Erro ao concluir coleta", error);
    }
  };

  const coletasFiltradas = coletas.filter((c) => {
    const matchStatus = filtros.status ? c.status === filtros.status : true;
    const matchMaterial = filtros.tipoMaterial ? c.tipoMaterial === filtros.tipoMaterial : true;
    const matchSolicitante = filtros.solicitante
      ? c.solicitante?.nome?.toLowerCase().includes(filtros.solicitante.toLowerCase())
      : true;
    return matchStatus && matchMaterial && matchSolicitante;
  });

  useEffect(() => {
    buscarColetas();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Gerenciamento de Coletas</h1>

      <div className="bg-white shadow-md rounded-md p-4 mb-6 flex flex-col md:flex-row gap-4">
        <select
          name="status"
          onChange={handleFiltroChange}
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={filtros.status}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="concluída">Concluída</option>
        </select>

        <select
          name="tipoMaterial"
          onChange={handleFiltroChange}
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={filtros.tipoMaterial}
        >
          <option value="">Todos os materiais</option>
          <option value="eletronicos">Eletrônicos</option>
          <option value="baterias">Baterias</option>
          <option value="pilhas">Pilhas</option>
        </select>

        <input
          type="text"
          name="solicitante"
          placeholder="Empresa solicitante"
          onChange={handleFiltroChange}
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={filtros.solicitante}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <ClipLoader size={35} color="#009951" />
        </div>
      ) : coletasFiltradas.length === 0 ? (
        <p className="text-center">Nenhuma coleta encontrada.</p>
      ) : (
        <div className="grid gap-4">
          {coletasFiltradas.map((coleta) => (
            <div key={coleta._id} className="bg-white p-4 rounded shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <p><strong>Status:</strong> {coleta.status}</p>
                  <p><strong>Material:</strong> {coleta.tipoMaterial}</p>
                  <p><strong>Quantidade:</strong> {coleta.quantidade}</p>
                  <p><strong>Impacto Ambiental:</strong> {coleta.impactoAmbiental} pontos</p>
                  <p><strong>Solicitante:</strong> {coleta.solicitante?.nome || "Desconhecido"}</p>
                  <p><strong>Endereço:</strong> {coleta.endereco}</p>
                  <p><strong>Data:</strong> {new Date(coleta.dataSolicitacao).toLocaleDateString()}</p>
                </div>

                {coleta.imagem && (
                  <img
                    src={import.meta.env.VITE_API_URL + coleta.imagem}
                    alt="Comprovante"
                    className="w-40 h-40 object-cover rounded border"
                  />
                )}

                {coleta.status !== "concluída" && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2 md:mt-0"
                    onClick={() => handleConcluir(coleta._id)}
                  >
                    Concluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PainelColetas;
