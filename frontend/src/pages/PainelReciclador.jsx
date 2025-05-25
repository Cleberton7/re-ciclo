import { useState, useEffect } from "react";
import { getSolicitacoesColeta } from "../services/coletaService";
import PainelGenerico from "../pages/PainelGenerico";
import "./styles/containerPrincipal.css";
import "./styles/PainelReciclador.css";

const PainelReciclador = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [filtros, setFiltros] = useState({
    tipoResiduo: "",
    distancia: "",
    urgencia: "",
  });

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        const dados = await getSolicitacoesColeta();
        setSolicitacoes(dados.data || dados);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      }
    };
    carregarSolicitacoes();
  }, [filtros]);

  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="coletor" />

      <div className="dashboard-container">
        <section className="resumo-operacional">
          <h2>RESUMO OPERACIONAL</h2>
          <p>
            - Total de coletas disponíveis:{" "}
            <strong>{solicitacoes.length}</strong>
          </p>
        </section>

        <section className="solicitacoes">
          <h2>SOLICITAÇÕES DISPONÍVEIS</h2>

          <div className="filtros">
            <select
              value={filtros.tipoResiduo}
              onChange={(e) =>
                setFiltros({ ...filtros, tipoResiduo: e.target.value })
              }
            >
              <option value="">Todos os tipos</option>
              <option value="eletrônicos">Eletrônicos</option>
              <option value="metais">Metais</option>
              <option value="plásticos">Plásticos</option>
            </select>
          </div>

          <div className="cards">
            {solicitacoes.length === 0 && (
              <p style={{ marginTop: "20px" }}>Nenhuma solicitação encontrada.</p>
            )}

            {solicitacoes
              .filter((s) =>
                filtros.tipoResiduo
                  ? s.tipoMaterial === filtros.tipoResiduo
                  : true
              )
              .map((solicitacao) => (
                <div key={solicitacao._id} className="card">
                  <h3>{solicitacao.tipoMaterial}</h3>
                  <p>
                    <strong>Quantidade:</strong> {solicitacao.quantidade}
                  </p>
                  <p>
                    <strong>Endereço:</strong> {solicitacao.endereco}
                  </p>
                  <p>
                    <strong>Status:</strong> {solicitacao.status}
                  </p>
                  {solicitacao.observacoes && (
                    <p>
                      <strong>Obs:</strong> {solicitacao.observacoes}
                    </p>
                  )}
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(solicitacao.createdAt).toLocaleDateString()}
                  </p>
                  {solicitacao.imagem && (
                    <img
                      src={solicitacao.imagem}
                      alt="Resíduo"
                      className="imagem-residuo"
                      style={{
                        width: "100%",
                        maxHeight: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <button>Aceitar Coleta</button>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PainelReciclador;
