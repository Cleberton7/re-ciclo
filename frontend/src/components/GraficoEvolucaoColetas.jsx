import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler // Importe o plugin Filler
} from 'chart.js';

// Registre todos os plugins necessários
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler // Registre o plugin Filler
);

const GraficoEvolucaoColetas = ({ dados = [] }) => {
  const dadosValidos = dados?.length > 0 && dados.some(item => item.total > 0);

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
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  const chartData = {
    labels: dados.map(item => {
      if (item.periodo.includes('-')) {
        const [year, month] = item.periodo.split('-');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${monthNames[parseInt(month) - 1]}/${year}`;
      }
      return item.periodo;
    }),
    datasets: [
      {
        label: 'Total Coletado (kg)',
        data: dados.map(item => item.total),
        borderColor: '#009951',
        backgroundColor: 'rgba(0, 153, 81, 0.1)',
        tension: 0.3,
        fill: {
          target: 'origin', // Preenche desde a origem (eixo y=0)
          above: 'rgba(0, 153, 81, 0.1)' // Cor do preenchimento
        },
        pointBackgroundColor: '#fff',
        pointBorderColor: '#009951',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${context.raw.toLocaleString('pt-BR')} kg`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => {
            return value.toLocaleString('pt-BR') + ' kg';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="background-color-grafico" style={{ 
      height: '400px',
      padding: '15px',
      borderRadius: '10px'
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GraficoEvolucaoColetas;