import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CORES_PADRAO = {
  'eletrônicos': '#FF9F40',
  'eletronicos': '#FF9F40',
  'plástico': '#FF6384',
  'plásticos': '#FF6384',
  'plastico': '#FF6384',
  'plasticos': '#FF6384',
  'metal': '#4BC0C0',
  'outros': '#8A2BE2'
};

const GraficoColetas = ({ dados = [], compactMode = false }) => {
  // Processamento universal dos dados
  const dadosProcessados = dados.map(item => ({
    tipoMaterial: item.tipoMaterial || 'Outros',
    total: item.quantidade || item.total || 0
  }));

  const dadosValidos = dadosProcessados.length > 0 && dadosProcessados.some(item => item.total > 0);

  if (!dadosValidos) {
    return (
      <div style={{
        height: compactMode ? '250px' : '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontStyle: 'italic'
      }}>
        Nenhum dado disponível
      </div>
    );
  }

  // Agrupa por tipoMaterial
  const dadosAgrupados = dadosProcessados.reduce((acc, item) => {
    const existente = acc.find(i => i.tipoMaterial === item.tipoMaterial);
    if (existente) {
      existente.total += item.total;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  const chartData = {
    labels: dadosAgrupados.map(item => item.tipoMaterial),
    datasets: [{
      data: dadosAgrupados.map(item => item.total),
      backgroundColor: dadosAgrupados.map(item => 
        CORES_PADRAO[item.tipoMaterial.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || '#CCCCCC'
      ),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: compactMode ? 'bottom' : 'right',
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.raw}kg`;
          }
        }
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: compactMode ? '250px' : '400px',
      margin: '0 auto',
      
    }}>
      <Pie 
        data={chartData} 
        options={options}
        redraw
      />
    </div>
  );
};

export default GraficoColetas;