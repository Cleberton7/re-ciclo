import React from 'react';
import '../pages/styles/FilterBar.css';

const FilterBar = ({ filters, onChange, role }) => {
  const handleFilterChange = (e) => {
    onChange({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="filter-bar">
        {role === 'public' && (
        <>
          <div className="filter-group">
            <label htmlFor="tipoMaterial">Tipo de Material:</label>
            <select
              id="tipoMaterial"
              name="tipoMaterial"
              value={filters.tipoMaterial || ''}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="eletrônicos">Eletrônicos</option>
              <option value="metais">Metais</option>
              <option value="plásticos">Plásticos</option>x
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="periodo">Período:</label>
            <select
              id="periodo"
              name="periodo"
              value={filters.periodo || 'mensal'}
              onChange={handleFilterChange}
            >
              <option value="mensal">Último mês</option>
              <option value="trimestral">Último trimestre</option>
              <option value="anual">Último ano</option>
              <option value="total">Todos os dados</option>
            </select>
          </div>
        </>
      )}
      {/* Filtros para Coletores */}
      {role === 'coletor' && (
        <>
          <div className="filter-group">
            <label htmlFor="tipoMaterial">Tipo de Material:</label>
            <select
              id="tipoMaterial"
              name="tipoMaterial"
              value={filters.tipoMaterial || ''}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="eletrônicos">Eletrônicos</option>
              <option value="metais">Metais</option>
              <option value="plásticos">Plásticos</option>
              <option value="vidro">Vidro</option>
              <option value="papel">Papel</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="distancia">Distância (km):</label>
            <select
              id="distancia"
              name="distancia"
              value={filters.distancia || ''}
              onChange={handleFilterChange}
            >
              <option value="">Qualquer</option>
              <option value="5">Até 5 km</option>
              <option value="10">Até 10 km</option>
              <option value="20">Até 20 km</option>
            </select>
          </div>
        </>
      )}

      {/* Filtros para Empresas */}
      {role === 'empresa' && (
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={filters.status || ''}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aceita">Aceita</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluída">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;