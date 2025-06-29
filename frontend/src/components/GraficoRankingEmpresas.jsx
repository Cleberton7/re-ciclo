import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GraficoRankingEmpresas = ({ ranking = [] }) => {
  const data = {
    labels: ranking.map(item => item.nomeFantasia || item.razaoSocial),
    datasets: [
      {
        label: 'Total Coletado (kg)',
        data: ranking.map(item => item.totalColetado),
        backgroundColor: '#009951',
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.raw.toLocaleString('pt-BR')} kg`;
          }
        }
      }
    },
    scales: {
      x: { 
        beginAtZero: true,
        grid: { display: false }
      },
      y: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="background-color-grafico" style={{ height: '400px', padding: '15px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoRankingEmpresas;