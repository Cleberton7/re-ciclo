import { useState, useEffect } from "react";
import { 
  getSolicitacoesColeta, 
  aceitarColeta, 
  concluirColeta 
} from "../services/coletaService";
import PainelGenerico from "../pages/PainelGenerico";
import Modal from "../components/Modal";
import "./styles/containerPrincipal.css";
import "./styles/painelReciclador.css";
import CloseButton from "../components/CloseButton";

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
  const [showModalConcluir, setShowModalConcluir] = useState(false);
  const [materiaisPersistentes, setMateriaisPersistentes] = useState({
    eletronicos: { quantidade: "", componentes: "" },
    metais: { quantidade: "" },
    plasticos: { quantidade: "" }
  });
  const [materiais, setMateriais] = useState(materiaisPersistentes);
  const [dataColeta, setDataColeta] = useState(new Date().toISOString().split('T')[0]);

  const formularioValido = () => {
    return (
      materiais.eletronicos.quantidade !== "" &&
      !isNaN(materiais.eletronicos.quantidade) &&
      Number(materiais.eletronicos.quantidade) > 0 &&
      dataColeta
    );
  };

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        setLoading((prev) => ({ ...prev, listagem: true }));
        const dados = await getSolicitacoesColeta(filtros);
        setSolicitacoes(dados);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
        mostrarNotificacao(error.message || "Erro ao carregar solicitações", "erro");
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
    setTimeout(() => setNotificacao((prev) => ({ ...prev, show: false })), 5000);
  };

  const handleAceitarColeta = async (idSolicitacao) => {
    try {
      setLoading((prev) => ({ ...prev, aceitando: idSolicitacao }));
      await aceitarColeta(idSolicitacao);
      setSolicitacoes((prev) => prev.filter((s) => s._id !== idSolicitacao));
      mostrarNotificacao("Coleta aceita com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao aceitar coleta:", error);
      mostrarNotificacao(error.message || "Erro ao aceitar coleta", "erro");
    } finally {
      setLoading((prev) => ({ ...prev, aceitando: null }));
    }
  };

  const abrirModalConclusao = (idSolicitacao) => {
    setConcluindoId(idSolicitacao);
    setDataColeta(new Date().toISOString().split('T')[0]);
    setMateriais(materiaisPersistentes);
    setLoading(prev => ({ ...prev, concluindo: false }));
    setShowModalConcluir(true);
  };

  const handleConcluirColeta = async () => {
    if (!formularioValido()) {
      mostrarNotificacao("Preencha corretamente os campos obrigatórios!", "erro");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, concluindo: true }));
      
      const dadosConclusao = {
        materiaisSeparados: {
          ...materiais,
          eletronicos: {
            ...materiais.eletronicos,
            quantidade: Number(materiais.eletronicos.quantidade)
          },
          metais: {
            quantidade: materiais.metais.quantidade ? Number(materiais.metais.quantidade) : 0
          },
          plasticos: {
            quantidade: materiais.plasticos.quantidade ? Number(materiais.plasticos.quantidade) : 0
          }
        },
        dataColeta: new Date(dataColeta).toISOString(),
        dataConclusao: new Date().toISOString()
      };

      await concluirColeta(concluindoId, dadosConclusao);
      setMateriaisPersistentes({
        eletronicos: { quantidade: "", componentes: "" },
        metais: { quantidade: "" },
        plasticos: { quantidade: "" }
      });
      setSolicitacoes(prev => prev.filter(s => s._id !== concluindoId));
      mostrarNotificacao("Coleta concluída com sucesso!", "sucesso");
      setShowModalConcluir(false);
      setMateriais({
        eletronicos: { quantidade: "", componentes: "" },
        metais: { quantidade: "" },
        plasticos: { quantidade: "" }
      });
    } catch (error) {
      console.error("Erro na conclusão:", error);
      mostrarNotificacao(error.message || "Falha ao concluir coleta. Tente novamente.", "erro");
    } finally {
      setLoading((prev) => ({ ...prev, concluindo: false }));
      setConcluindoId(null);
    }
  };
  const handleCloseModal = () => {
    setMateriaisPersistentes(materiais);
    setShowModalConcluir(false);
    setConcluindoId(null);
    setLoading(prev => ({ ...prev, concluindo: false }));
  };
  const handleQuantidadeChange = (tipo, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const novosMateriais={
        ...materiais,
        [tipo]:{
          ...materiais[tipo],
          quantidade:value
        }
      };
      setMateriais(novosMateriais);
    }
  };

  const handleDataColetaChange = (e) => {
    setDataColeta(e.target.value);
  };

  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="centro" />

      <div className="dashboard-container">
        {notificacao.show && (
          <div className={`notificacao ${notificacao.tipo}`}>
            {notificacao.mensagem}
            <CloseButton 
              onClose={() => setNotificacao((prev) => ({ ...prev, show: false }))} 
              className="fechar-notificacao"
            />
          </div>
        )}

        <section className="resumo-operacional">
          <h2>RESUMO OPERACIONAL</h2>
          <p>
            - Coletas disponíveis:{" "}
            <strong>{loading.listagem ? "Carregando..." : solicitacoes.length}</strong>
          </p>
        </section>

        <section className="solicitacoes">
          <h2>SOLICITAÇÕES DISPONÍVEIS</h2>

          <div className="filtros">
            <select
              value={filtros.tipoResiduo}
              onChange={(e) => setFiltros({ ...filtros, tipoResiduo: e.target.value })}
            >
              <option value="">Todos os tipos</option>
              <option value="eletrônicos">Eletrônicos</option>
              <option value="metais">Metais</option>
              <option value="plásticos">Plásticos</option>
              <option value="outros">Outros</option>
            </select>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
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
                  <p><strong>Quantidade:</strong> {solicitacao.quantidade} kg</p>
                  <p><strong>Endereço:</strong> {solicitacao.endereco}</p>
                  <p><strong>Status:</strong> {solicitacao.status}</p>
                  
                  {solicitacao.dataColeta && (
                    <p><strong>Data Coleta:</strong> {new Date(solicitacao.dataColeta).toLocaleDateString()}</p>
                  )}
                  
                  {solicitacao.dataConclusao && (
                    <p><strong>Concluída em:</strong> {new Date(solicitacao.dataConclusao).toLocaleDateString()}</p>
                  )}
                  
                  {solicitacao.observacoes && (
                    <p><strong>Obs:</strong> {solicitacao.observacoes}</p>
                  )}
                  
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {solicitacao.solicitante?.nomeFantasia || 
                     solicitacao.solicitante?.razaoSocial ||
                     solicitacao.solicitante?.nome || 
                     "Anônimo"}
                  </p>
                  
                  <p>
                    <strong>Solicitado em:</strong>{" "}
                    {new Date(solicitacao.createdAt).toLocaleDateString()}
                  </p>
                  
                  {solicitacao.imagem && (
                    <img src={solicitacao.imagem} alt="Resíduo" className="imagem-residuo" />
                  )}

                  {solicitacao.status === "pendente" && (
                    <button
                      onClick={() => handleAceitarColeta(solicitacao._id)}
                      disabled={loading.aceitando === solicitacao._id}
                    >
                      {loading.aceitando === solicitacao._id ? "Aceitando..." : "Aceitar Coleta"}
                    </button>
                  )}

                  {solicitacao.status === "aceita" && (
                    <button
                      onClick={() => abrirModalConclusao(solicitacao._id)}
                      disabled={concluindoId === solicitacao._id}
                      className="btn-concluir"
                    >
                      {concluindoId === solicitacao._id ? "Concluindo..." : "Confirmar Retirada"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <Modal
          isOpen={showModalConcluir}
          onClose={handleCloseModal}
          size="form-coleta"
          shouldCloseOnOverlayClick={true}
        >
          <div className="form-modal-content">
            <h3>Detalhar Materiais Coletados</h3>

            <div className="form-group">
              <label>Data da Coleta*</label>
              <input
                type="date"
                value={dataColeta}
                onChange={handleDataColetaChange}
                className="valid"
                required
              />
            </div>

            <div className="form-group">
              <label>Eletrônicos (kg)*</label>
              <input
                type="text"
                value={materiais.eletronicos.quantidade}
                onChange={(e) => handleQuantidadeChange('eletronicos', e.target.value)}
                className={materiais.eletronicos.quantidade && !isNaN(materiais.eletronicos.quantidade) ? 'valid' : 'invalid'}
                required
              />
              {materiais.eletronicos.quantidade && isNaN(materiais.eletronicos.quantidade) && (
                <span className="error-message">Digite um número válido</span>
              )}
            </div>

            <div className="form-group">
              <label>Componentes (opcional)</label>
              <input
                type="text"
                value={materiais.eletronicos.componentes}
                onChange={(e) => setMateriais({
                  ...materiais,
                  eletronicos: {
                    ...materiais.eletronicos,
                    componentes: e.target.value
                  }
                })}
                placeholder="Ex: placas, fios, baterias"
              />
            </div>

            <div className="form-group">
              <label>Metais (kg)</label>
              <input
                type="text"
                value={materiais.metais.quantidade}
                onChange={(e) => handleQuantidadeChange('metais', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Plásticos (kg)</label>
              <input
                type="text"
                value={materiais.plasticos.quantidade}
                onChange={(e) => handleQuantidadeChange('plasticos', e.target.value)}
              />
            </div>

            <button
              onClick={handleConcluirColeta}
              disabled={!formularioValido() || loading.concluindo}
              className={`btn-enviar ${!formularioValido() ? 'disabled' : ''}`}
            >
              {loading.concluindo ? (
                <>
                  <span className="spinner"></span> Salvando...
                </>
              ) : (
                'Concluir Coleta'
              )}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PainelReciclador;