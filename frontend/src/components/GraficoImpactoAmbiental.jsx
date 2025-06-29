import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GraficoImpactoAmbiental = ({ impactoAtual = 0, meta = 10000 }) => {
  const restante = Math.max(meta - impactoAtual, 0);

  const data = {
    labels: ['CO₂ Evitado', 'Meta Restante'],
    datasets: [
      {
        data: [impactoAtual, restante],
        backgroundColor: ['#009951', '#e0e0e0'],
        borderWidth: 0
      }
    ]
  };

  const options = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString('pt-BR')} kg`;
          }
        }
      }
    }
  };

  return (
    <div className="background-color-grafico" style={{ 
      height: '300px', 
      padding: '15px',
      position: 'relative'
    }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>CO₂ Evitado</p>
        <p style={{ 
          margin: 0, 
          fontSize: '22px', 
          color: '#009951',
          fontWeight: 'bold'
        }}>
          {(impactoAtual/1000).toLocaleString('pt-BR')} ton
        </p>
      </div>
    </div>
  );
};

export default GraficoImpactoAmbiental;