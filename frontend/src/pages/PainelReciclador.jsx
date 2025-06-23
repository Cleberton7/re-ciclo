import { useState, useEffect } from "react";
import { 
  getSolicitacoesColeta, 
  aceitarColeta, 
  concluirColeta 
} from "../services/coletaService";

import PainelGenerico from "../pages/PainelGenerico";
import "./styles/containerPrincipal.css";
import "./styles/painelReciclador.css";

const PainelReciclador = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [concluindoId, setConcluindoId] = useState(null);
  const [filtros, setFiltros] = useState({
    tipoResiduo: "",
    status: "pendente"
  });
  const [loading, setLoading] = useState({
    listagem: false,
    aceitando: null
  });
  const [notificacao, setNotificacao] = useState({
    show: false,
    mensagem: "",
    tipo: ""
  });

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        setLoading((prev) => ({ ...prev, listagem: true }));
        const dados = await getSolicitacoesColeta(filtros);
        setSolicitacoes(dados);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        mostrarNotificacao(
          error.message || "Erro ao carregar solicitações",
          "erro"
        );
      } finally {
        setLoading((prev) => ({ ...prev, listagem: false }));
      }
    };

    carregarSolicitacoes();
  }, [filtros]);

  const mostrarNotificacao = (mensagem, tipo) => {
    setNotificacao({
      show: true,
      mensagem,
      tipo
    });

    setTimeout(() => {
      setNotificacao((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleAceitarColeta = async (idSolicitacao) => {
    try {
      setLoading((prev) => ({ ...prev, aceitando: idSolicitacao }));
      await aceitarColeta(idSolicitacao);
      setSolicitacoes((prev) =>
        prev.filter((s) => s._id !== idSolicitacao)
      );
      mostrarNotificacao("Coleta aceita com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao aceitar coleta:", error);
      mostrarNotificacao(error.message || "Erro ao aceitar coleta", "erro");
    } finally {
      setLoading((prev) => ({ ...prev, aceitando: null }));
    }
  };

  const handleConcluirColeta = async (idSolicitacao) => {
    try {
      setConcluindoId(idSolicitacao);
      await concluirColeta(idSolicitacao);
      
      // Atualiza a lista removendo a coleta concluída
      setSolicitacoes(prev => prev.filter(s => s._id !== idSolicitacao));
      
      mostrarNotificacao("Coleta concluída com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro na conclusão:", error);
      mostrarNotificacao(
        error.message || "Falha ao concluir coleta. Tente novamente.", 
        "erro"
      );
    } finally {
      setConcluindoId(null);
    }
  };

  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="centro" />

      <div className="dashboard-container">
        {notificacao.show && (
          <div className={`notificacao ${notificacao.tipo}`}>
            {notificacao.mensagem}
            <button
              onClick={() => setNotificacao((prev) => ({ ...prev, show: false }))}
              className="fechar-notificacao"
            >
              ×
            </button>
          </div>
        )}

        <section className="resumo-operacional">
          <h2>RESUMO OPERACIONAL</h2>
          <p>
            - Coletas disponíveis:{" "}
            <strong>
              {loading.listagem ? "Carregando..." : solicitacoes.length}
            </strong>
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
              <option value="outros">Outros</option>
            </select>

            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
            >
              <option value="pendente">Pendentes</option>
              <option value="aceita">Aceitas</option>
              <option value="concluída">Concluídas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <div className="cards">
            {loading.listagem ? (
              <p style={{ marginTop: "20px" }}>Carregando solicitações...</p>
            ) : solicitacoes.length === 0 ? (
              <p style={{ marginTop: "20px" }}>Nenhuma solicitação encontrada.</p>
            ) : (
              solicitacoes.map((solicitacao) => (
                <div key={solicitacao._id} className="card">
                  <h3>{solicitacao.tipoMaterial}</h3>
                  <p><strong>Quantidade:</strong> {solicitacao.quantidade}</p>
                  <p><strong>Endereço:</strong> {solicitacao.endereco}</p>
                  <p><strong>Status:</strong> {solicitacao.status}</p>
                  {solicitacao.observacoes && (
                    <p><strong>Obs:</strong> {solicitacao.observacoes}</p>
                  )}
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {solicitacao.solicitante?.nome || "Não informado"}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(solicitacao.createdAt).toLocaleDateString()}
                  </p>
                  {solicitacao.imagem && (
                    <img
                      src={solicitacao.imagem}
                      alt="Resíduo"
                      className="imagem-residuo"
                    />
                  )}

                  {solicitacao.status === "pendente" && (
                    <button
                      onClick={() => handleAceitarColeta(solicitacao._id)}
                      disabled={loading.aceitando === solicitacao._id}
                    >
                      {loading.aceitando === solicitacao._id
                        ? "Aceitando..."
                        : "Aceitar Coleta"}
                    </button>
                  )}

                  {solicitacao.status === "aceita" && (
                    <button
                      onClick={() => handleConcluirColeta(solicitacao._id)}
                      disabled={concluindoId === solicitacao._id}
                      className="btn-concluir"
                    >
                      {concluindoId === solicitacao._id
                        ? "Concluindo..."
                        : "Confirmar Retirada"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PainelReciclador;
