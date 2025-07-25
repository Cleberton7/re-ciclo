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
  const dadosProcessados = dados.map(item => ({
    tipoMaterial: item.tipoMaterial || 'Outros',
    total: item.quantidade || item.total || 0
  }));

  const dadosValidos = dadosProcessados.length > 0 && dadosProcessados.some(item => item.total > 0);

  if (!dadosValidos) {
    return (
      <div className="background-color-grafico" style={{
        height: '300px',
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

  const dadosAgrupados = dadosProcessados.reduce((acc, item) => {
    const tipoNormalizado = item.tipoMaterial.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const existente = acc.find(i => 
      i.tipoMaterial.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === tipoNormalizado
    );
    
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
      borderWidth: 1,
      borderColor: '#fff'
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
            size: compactMode ? 12 : 14
          },
          color: '#333' // Cor do texto da legenda
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}kg (${percentage}%)`;
          }
        },
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16
        }
      }
    }
  };

  return (
    <div className="background-color-grafico" style={{
      width: '100%',
      height: compactMode ? '250px' : '300px',
      padding: '15px',
      borderRadius: '10px'
    }}>
      <Pie 
        data={chartData} 
        options={options}
      />
    </div>
  );
};

export default GraficoColetas;