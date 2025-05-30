import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GraficoColetas = ({ dados }) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="grafico-placeholder">
        <p>Não há dados suficientes para exibir o gráfico</p>
      </div>
    );
  }

  const cores = {
    'plástico': '#FF6384',
    'papel': '#36A2EB',
    'vidro': '#FFCE56',
    'metal': '#4BC0C0',
    'orgânico': '#9966FF',
    'eletrônicos': '#FF9F40',
    'outros': '#8A2BE2'
  };

  const chartData = {
    labels: dados.map(item => item._id),
    datasets: [{
      data: dados.map(item => item.total),
      backgroundColor: dados.map(item => cores[item._id.toLowerCase()] || '#' + Math.floor(Math.random()*16777215).toString(16)),
      borderWidth: 1
    }]
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}kg (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', margin: '20px 0' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default GraficoColetas;