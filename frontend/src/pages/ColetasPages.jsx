import React, { useState, useEffect } from "react";
import  useAuth from "../contexts/authFunctions";
import { 
  getSolicitacoesColeta, 
  aceitarColeta,
  atualizarColeta,
  cancelarColeta 
} from "../services/coletaService";
import FilterBar from "../components/FilterBar";
import ColetaCard from "../components/ColetaCard";
import ModalColeta from "../components/ModalColeta"; // Novo componente para edição
import "./styles/containerPrincipal.css";
import "./styles/ColetaPages.css";

const ColetasPage = () => {
  const { role, userData } = useAuth();
  const [coletas, setColetas] = useState([]);
  const [filters, setFilters] = useState({
    tipoMaterial: "",
    status: role === "coletor" ? "pendente" : "",
  });
  const [coletaEditando, setColetaEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carrega as coletas com os filtros aplicados
  useEffect(() => {
    const loadColetas = async () => {
      try {
        const data = await getSolicitacoesColeta({
          ...filters,
          // Para empresas, filtra apenas as próprias solicitações
          ...(role === "empresa" && { solicitante: userData._id })
        });
        setColetas(data);
      } catch (error) {
        console.error("Erro ao carregar coletas:", error);
      }
    };
    loadColetas();
  }, [filters, role, userData]);

  // Ações para coletores
  const handleAceitarColeta = async (id) => {
    try {
      await aceitarColeta(id);
      setColetas(coletas.map(c => 
        c._id === id ? { ...c, status: "aceita" } : c
      ));
    } catch (error) {
      console.error("Erro ao aceitar coleta:", error);
    }
  };

  // Ações para empresas
  const handleEditarColeta = (coleta) => {
    setColetaEditando(coleta);
    setShowModal(true);
  };

  const handleSalvarEdicao = async (coletaAtualizada) => {
    try {
      await atualizarColeta(coletaEditando._id, coletaAtualizada);
      setColetas(coletas.map(c => 
        c._id === coletaEditando._id ? { ...c, ...coletaAtualizada } : c
      ));
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao atualizar coleta:", error);
    }
  };

  const handleCancelarColeta = async (id) => {
    try {
      await cancelarColeta(id);
      setColetas(coletas.map(c => 
        c._id === id ? { ...c, status: "cancelada" } : c
      ));
    } catch (error) {
      console.error("Erro ao cancelar coleta:", error);
    }
  };

  return (
    <div className="coletas-container" id="containerPrincipal">
      <h1>{role === "empresa" ? "Minhas Solicitações" : "Coletas Disponíveis"}</h1>
      
      <FilterBar 
        filters={filters}
        onChange={setFilters}
        role={role}
      />

      <div className="coletas-grid">
        {coletas.length === 0 ? (
          <div className="nenhuma-coleta">
            <p>Nenhuma coleta encontrada.</p>
            {role === "empresa" && (
              <button 
                className="btn-nova-coleta"
                onClick={() => {
                  setColetaEditando(null);
                  setShowModal(true);
                }}
              >
                + Nova Solicitação
              </button>
            )}
          </div>
        ) : (
          coletas.map((coleta) => (
            <ColetaCard
              key={coleta._id}
              coleta={coleta}
              role={role}
              onAccept={handleAceitarColeta}
              onEdit={handleEditarColeta}
              onCancel={handleCancelarColeta}
            />
          ))
        )}
      </div>

      {/* Modal para edição/criação de coletas */}
      {showModal && (
        <ModalColeta
          coleta={coletaEditando}
          onClose={() => setShowModal(false)}
          onSave={handleSalvarEdicao}
          isEdit={!!coletaEditando}
        />
      )}
    </div>
  );
};

export default ColetasPage;