import { useState, useEffect } from "react";
import { 
  getSolicitacoesColeta, 
  aceitarColeta, 
  concluirColeta,
  buscarColetaPorCodigo
} from "../services/coletaService";
import PainelGenerico from "../components/PainelGenerico/PainelGenerico";
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
    aceitando: null,
    buscandoCodigo: false,
    concluindo: false
  });
  const [notificacao, setNotificacao] = useState({
    show: false,
    mensagem: "",
    tipo: ""
  });
  const [showModalConcluir, setShowModalConcluir] = useState(false);
  const [codigoRastreamento, setCodigoRastreamento] = useState("");
  const [coletaRecuperada, setColetaRecuperada] = useState(null);
  
  const materiaisIniciais = {
    telefonia: { quantidade: "", componentes: "" },
    informatica: { quantidade: "", componentes: "" },
    eletrodomesticos: { quantidade: "", componentes: "" },
    pilhas_baterias: { quantidade: "", componentes: "" },
    outros: { quantidade: "", componentes: "" }
  };
  
  const [materiais, setMateriais] = useState(materiaisIniciais);
  const [dataColeta, setDataColeta] = useState(new Date().toISOString().split('T')[0]);

  const formatarTipoMaterial = (tipo, outros) => {
    if (!tipo) return "Desconhecido";

    if (tipo === "outros" && outros) {
      return `Outros (${outros})`;
    }

    switch (tipo) {
      case "telefonia":
        return "Telefonia e Acessórios";
      case "informatica":
        return "Informática";
      case "eletrodomesticos":
        return "Eletrodomésticos";
      case "pilhas_baterias":
        return "Pilhas e Baterias";
      case "outros":
        return "Outros Eletroeletrônicos";
      default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  const formatarCodigoRastreamento = (codigo) => {
    if (!codigo) return "";
    if (codigo.length <= 5) return codigo;
    return `${codigo.substring(0, 5)}-${codigo.substring(5, 10)}`;
  };

  const formularioValido = () => {
    return Object.values(materiais).some(
      material => material.quantidade !== "" && 
                 !isNaN(material.quantidade) && 
                 Number(material.quantidade) > 0
    ) && dataColeta;
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

  const buscarColeta = async () => {
    const codigoLimpo = codigoRastreamento.replace("-", "").toUpperCase();
    
    if (!codigoLimpo || codigoLimpo.length !== 10) {
      mostrarNotificacao("Digite um código de rastreamento válido (10 caracteres)", "erro");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, buscandoCodigo: true }));
      const coleta = await buscarColetaPorCodigo(codigoLimpo);
      
      if (!coleta) {
        mostrarNotificacao("Nenhuma coleta encontrada com este código", "erro");
        return;
      }
      
      if (coleta.status !== "aceita") {
        mostrarNotificacao("Esta coleta não está com status 'aceita'", "erro");
        return;
      }
      
      setColetaRecuperada(coleta);
      setConcluindoId(coleta._id);
      
      const novosMateriais = { ...materiaisIniciais };
      
      if (coleta.tipoMaterial && coleta.tipoMaterial in novosMateriais && coleta.quantidade) {
        novosMateriais[coleta.tipoMaterial] = {
          quantidade: coleta.quantidade.toString(),
          componentes: coleta.componentes || ""
        };
      }
      
      setMateriais(novosMateriais);
      
      if (coleta.dataColeta) {
        setDataColeta(new Date(coleta.dataColeta).toISOString().split('T')[0]);
      }
      
      setShowModalConcluir(true);
      mostrarNotificacao("Coleta encontrada! Preencha os detalhes da coleta.", "sucesso");
      
    } catch (error) {
      console.error("Erro ao buscar coleta:", error);
      mostrarNotificacao(error.message || "Erro ao buscar coleta", "erro");
    } finally {
      setLoading((prev) => ({ ...prev, buscandoCodigo: false }));
    }
  };

  const abrirModalConclusao = (idSolicitacao) => {
    const solicitacao = solicitacoes.find(s => s._id === idSolicitacao);
    if (!solicitacao) {
      mostrarNotificacao("Solicitação não encontrada", "erro");
      return;
    }
    
    setConcluindoId(idSolicitacao);
    setColetaRecuperada(solicitacao);
    
    const novosMateriais = { ...materiaisIniciais };
    
    if (solicitacao.tipoMaterial && solicitacao.tipoMaterial in novosMateriais && solicitacao.quantidade) {
      novosMateriais[solicitacao.tipoMaterial] = {
        quantidade: solicitacao.quantidade.toString(),
        componentes: solicitacao.componentes || ""
      };
    }
    
    setMateriais(novosMateriais);
    
    if (solicitacao.dataColeta) {
      setDataColeta(new Date(solicitacao.dataColeta).toISOString().split('T')[0]);
    } else {
      setDataColeta(new Date().toISOString().split('T')[0]);
    }
    
    setShowModalConcluir(true);
  };

  const handleConcluirColeta = async () => {
    if (!formularioValido()) {
      mostrarNotificacao("Preencha pelo menos uma categoria com quantidade válida!", "erro");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, concluindo: true }));
      
      const materiaisSeparados = {};
      
      Object.entries(materiais).forEach(([categoria, dados]) => {
        if (dados.quantidade && !isNaN(dados.quantidade) && Number(dados.quantidade) > 0) {
          materiaisSeparados[categoria] = {
            quantidade: Number(dados.quantidade),
            componentes: dados.componentes || ""
          };
        }
      });

      const dadosConclusao = {
        materiaisSeparados,
        dataColeta: new Date(dataColeta).toISOString(),
        dataConclusao: new Date().toISOString()
      };

      await concluirColeta(concluindoId, dadosConclusao);
      
      setMateriais(materiaisIniciais);
      
      setSolicitacoes(prev => prev.filter(s => s._id !== concluindoId));
      mostrarNotificacao("Coleta concluída com sucesso!", "sucesso");
      setShowModalConcluir(false);
      
      setCodigoRastreamento("");
      setColetaRecuperada(null);
    } catch (error) {
      console.error("Erro na conclusão:", error);
      mostrarNotificacao(error.message || "Falha ao concluir coleta. Tente novamente.", "erro");
    } finally {
      setLoading((prev) => ({ ...prev, concluindo: false }));
      setConcluindoId(null);
    }
  };

  const handleCloseModal = () => {
    setMateriais(materiaisIniciais);
    setShowModalConcluir(false);
    setConcluindoId(null);
    setColetaRecuperada(null);
    setLoading(prev => ({ ...prev, concluindo: false }));
  };

  const handleQuantidadeChange = (tipo, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const novosMateriais = {
        ...materiais,
        [tipo]: {
          ...materiais[tipo],
          quantidade: value
        }
      };
      setMateriais(novosMateriais);
    }
  };

  const handleComponentesChange = (tipo, value) => {
    const novosMateriais = {
      ...materiais,
      [tipo]: {
        ...materiais[tipo],
        componentes: value
      }
    };
    setMateriais(novosMateriais);
  };

  const handleDataColetaChange = (e) => {
    setDataColeta(e.target.value);
  };

  const handleCodigoChange = (e) => {
    let value = e.target.value.replace("-", "").toUpperCase();
    
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    
    setCodigoRastreamento(value);
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
          
          <div className="busca-codigo-rastreamento">
            <h3>Concluir Coleta por Código</h3>
            <div className="input-group">
              <input 
                type="text"
                value={codigoRastreamento}
                onChange={handleCodigoChange}
                placeholder="Digite o código de rastreamento (ex: 20230910-3)"
                maxLength={11}
                className="codigo-input"
              />
              <button 
                className="btn-buscar-codigo"
                onClick={buscarColeta}
                disabled={loading.buscandoCodigo || !codigoRastreamento}
              >
                {loading.buscandoCodigo ? "Buscando..." : "Buscar Coleta"}
              </button>
            </div>
          </div>
        </section>

        <section className="solicitacoes">
          <h2>SOLICITAÇÕES DISPONÍVEIS</h2>

          <div className="filtros">
            <select
              value={filtros.tipoResiduo}
              onChange={(e) => setFiltros({ ...filtros, tipoResiduo: e.target.value })}
            >
              <option value="">Todos os tipos</option>
              <option value="telefonia">Telefonia e Acessórios</option>
              <option value="informatica">Informática</option>
              <option value="eletrodomesticos">Eletrodomésticos</option>
              <option value="pilhas_baterias">Pilhas e Baterias</option>
              <option value="outros">Outros Eletroeletrônicos</option>
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
                  <h3>
                    {formatarTipoMaterial(solicitacao.tipoMaterial, solicitacao.outros)}
                  </h3>
                  <p><strong>Código:</strong> {formatarCodigoRastreamento(solicitacao.codigoRastreamento)}</p>
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
            
            {coletaRecuperada && (
              <div className="coleta-info">
                <h4>Informações da Coleta</h4>
                <p><strong>Código:</strong> {formatarCodigoRastreamento(coletaRecuperada.codigoRastreamento)}</p>
                <p><strong>Tipo:</strong> {formatarTipoMaterial(coletaRecuperada.tipoMaterial, coletaRecuperada.outros)}</p>
                <p><strong>Quantidade Estimada:</strong> {coletaRecuperada.quantidade} kg</p>
                <p><strong>Endereço:</strong> {coletaRecuperada.endereco}</p>
                {coletaRecuperada.observacoes && (
                  <p><strong>Observações:</strong> {coletaRecuperada.observacoes}</p>
                )}
              </div>
            )}

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

            {Object.entries({
              telefonia: "Telefonia e Acessórios",
              informatica: "Informática",
              eletrodomesticos: "Eletrodomésticos",
              pilhas_baterias: "Pilhas e Baterias",
              outros: "Outros Eletroeletrônicos"
            }).map(([categoria, label]) => (
              <div key={categoria}>
                <div className="form-group">
                  <label>{label} (kg)</label>
                  <input
                    type="text"
                    value={materiais[categoria]?.quantidade || ""}
                    onChange={(e) => handleQuantidadeChange(categoria, e.target.value)}
                    className={materiais[categoria]?.quantidade && !isNaN(materiais[categoria]?.quantidade) ? 'valid' : ''}
                    placeholder="Quantidade em kg"
                  />
                  {materiais[categoria]?.quantidade && isNaN(materiais[categoria]?.quantidade) && (
                    <span className="error-message">Digite um número válido</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Componentes de {label} (opcional)</label>
                  <input
                    type="text"
                    value={materiais[categoria]?.componentes || ""}
                    onChange={(e) => handleComponentesChange(categoria, e.target.value)}
                    placeholder={`Ex: ${categoria === 'telefonia' ? 'celulares, carregadores' : categoria === 'informatica' ? 'placas, memórias' : categoria === 'eletrodomesticos' ? 'motores, compressores' : categoria === 'pilhas_baterias' ? 'pilhas alcalinas, baterias Li-ion' : 'diversos componentes'}`}
                  />
                </div>
              </div>
            ))}

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