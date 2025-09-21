import React, { useState, useRef, useEffect } from 'react';
import { 
  FaFilter, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp, 
  FaMapMarkerAlt // ✅ Ícone adicionado
} from 'react-icons/fa';
import '../pages/styles/filtroMapa.css';

const FiltroMapa = ({ 
  filtros = {}, 
  onFiltroChange = () => {}, 
  tiposMateriaisOptions = [],
  raioDistancia = 10,
  onRaioChange = () => {}
}) => {
  const [mostrarMateriais, setMostrarMateriais] = useState(false);
  const [mostrarRaio, setMostrarRaio] = useState(false);
  const dropdownRef = useRef(null);
  const raioDropdownRef = useRef(null);

  // Normaliza o campo "tipo" (suporta tanto string quanto array vindo do parent)
  const normalizeTipo = (f) => {
    const raw = f.tipo ?? f.tipos ?? 'todos';
    if (Array.isArray(raw)) {
      const hasEmpresa = raw.includes('empresa');
      const hasCentro = raw.includes('centro');
      if (hasEmpresa && hasCentro) return 'todos';
      if (hasEmpresa) return 'empresa';
      if (hasCentro) return 'centro';
      return 'todos';
    }
    return raw ?? 'todos';
  };

  const tipoAtual = normalizeTipo(filtros);
  const materiaisAtuais = filtros.materiais ?? [];

  // estados booleanos usados pelos checkboxes (sempre booleanos -> evita warning)
  const empresaChecked = tipoAtual === 'todos' || tipoAtual === 'empresa';
  const centroChecked = tipoAtual === 'todos' || tipoAtual === 'centro';

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarMateriais(false);
      }
      if (raioDropdownRef.current && !raioDropdownRef.current.contains(event.target)) {
        setMostrarRaio(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTipo = (which) => {
    const nextEmpresa = which === 'empresa' ? !empresaChecked : empresaChecked;
    const nextCentro = which === 'centro' ? !centroChecked : centroChecked;

    let newTipo;
    if (nextEmpresa && nextCentro) newTipo = 'todos';
    else if (nextEmpresa) newTipo = 'empresa';
    else if (nextCentro) newTipo = 'centro';
    else newTipo = 'todos'; // fallback para evitar "nenhum" e comportamento inesperado

    onFiltroChange({
      ...filtros,
      tipo: newTipo
    });
  };

  const handleMaterialChange = (material) => {
    const novosMateriais = materiaisAtuais.includes(material)
      ? materiaisAtuais.filter(m => m !== material)
      : [...materiaisAtuais, material];

    onFiltroChange({
      ...filtros,
      materiais: novosMateriais
    });
  };

  const limparFiltros = () => {
    onFiltroChange({
      ...filtros,
      tipo: 'todos',
      materiais: []
    });
    setMostrarMateriais(false);
  };

  const toggleMateriais = () => setMostrarMateriais(!mostrarMateriais);
  const toggleRaio = () => setMostrarRaio(!mostrarRaio);

  const handleRaioChange = (novoRaio) => {
    onRaioChange(novoRaio);
    setMostrarRaio(false);
  };

  // Opções de raio pré-definidas (em quilômetros)
  const opcoesRaio = [1, 5, 10, 20, 50];

  // mostrar botão limpar apenas se diferente do padrão
  const filtrosAtivos = tipoAtual !== 'todos' || materiaisAtuais.length > 0;

  return (
    <div className="filtro-mapa-container">
      <div className="filtro-group">
        <label>
          <FaFilter size={12} />
        </label>

        <div className="filtro-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!empresaChecked}
              onChange={() => toggleTipo('empresa')}
            />
            Empresas
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!centroChecked}
              onChange={() => toggleTipo('centro')}
            />
            Centros
          </label>
        </div>
      </div>

      <div className="filtro-group" ref={raioDropdownRef}>
        <div className="raio-dropdown">
          <button
            className={`dropdown-toggle ${raioDistancia > 10 ? 'active' : ''}`}
            onClick={toggleRaio}
            type="button"
          >
            <FaMapMarkerAlt size={12} style={{marginRight: '5px'}} />
            {raioDistancia} km
            {mostrarRaio ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>

          {mostrarRaio && (
            <div className="dropdown-content raio-options">
              {opcoesRaio.map(raio => (
                <button
                  key={raio}
                  className={`raio-option ${raio === raioDistancia ? 'selected' : ''}`}
                  onClick={() => handleRaioChange(raio)}
                >
                  {raio} km
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filtro-group">
        <div className="materiais-dropdown" ref={dropdownRef}>
          <button
            className={`dropdown-toggle ${materiaisAtuais.length > 0 ? 'active' : ''}`}
            onClick={toggleMateriais}
            type="button"
          >
            Materiais
            {materiaisAtuais.length > 0 && (
              <span className="materiais-badge">{materiaisAtuais.length}</span>
            )}
            {mostrarMateriais ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>

          {mostrarMateriais && (
            <div className="dropdown-content">
              <div className="materiais-checkboxes">
                {tiposMateriaisOptions.map(material => (
                  <label key={material} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={materiaisAtuais.includes(material)}
                      onChange={() => handleMaterialChange(material)}
                    />
                    {material}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {filtrosAtivos && (
        <button className="limpar-filtros" onClick={limparFiltros} type="button" aria-label="Limpar filtros">
          <FaTimes size={12} style={{ marginRight: 6 }} />
          Limpar
        </button>
      )}
    </div>
  );
};

export default FiltroMapa;