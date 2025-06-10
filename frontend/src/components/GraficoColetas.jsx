import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Cores padrão atualizadas para incluir variações
const CORES_PADRAO = {
  'eletrônicos': '#FF9F40',
  'eletronicos': '#FF9F40', // versão sem acento
  'plástico': '#FF6384',
  'plásticos': '#FF6384', // plural
  'plastico': '#FF6384', // sem acento
  'plasticos': '#FF6384', // plural sem acento
  'metal': '#4BC0C0',
  'outros': '#8A2BE2'
};

const GraficoColetas = ({ dados = [] }) => {
  // Verificação segura dos dados
  if (!Array.isArray(dados)) {
    return (
      <div className="grafico-placeholder">
        <p>Dados inválidos para exibir o gráfico</p>
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div className="grafico-placeholder">
        <p>Não há dados suficientes para exibir o gráfico</p>
      </div>
    );
  }

  // Função para normalizar o tipo de material
  const normalizarTipo = (tipo) => {
    if (!tipo) return 'outros';
    
    return tipo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/s$/, ''); // remove plural
  };

  // Processamento dos dados
  const chartData = {
    labels: dados.map(item => item.tipoMaterial || 'Outros'),
    datasets: [{
      data: dados.map(item => item.total || 0),
      backgroundColor: dados.map(item => {
        const tipoNormalizado = normalizarTipo(item.tipoMaterial);
        return CORES_PADRAO[tipoNormalizado] || '#CCCCCC'; // cinza como fallback
      }),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || 'Outros';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value}kg (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', margin: '20px 0', position: 'relative' }}>
      <Pie 
        data={chartData} 
        options={options}
        redraw
      />
    </div>
  );
};

export default GraficoColetas;