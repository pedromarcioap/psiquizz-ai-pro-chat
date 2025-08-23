import React from 'react';
import { Line } from 'react-chartjs-2'; // Alterado de Bar para Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Adicionado PointElement
  LineElement, // Alterado de BarElement para LineElement
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // Adicionado PointElement
  LineElement, // Alterado de BarElement para LineElement
  Title,
  Tooltip,
  Legend
);

const PerformanceChart = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return <p className="text-gray-500">Dados insuficientes para gerar o gráfico.</p>;
  }

  // Ordenar as tentativas por data para o gráfico de evolução
  const sortedAttempts = [...attempts].sort((a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime());

  const labels = sortedAttempts.map(a => a.topic || `Tentativa ${a.attemptedAt?.toLocaleDateString('pt-BR') || ''}`);
  const scores = sortedAttempts.map(a => {
    if (!a || !a.totalQuestions || a.totalQuestions === 0) return 0;
    const percent = (a.score / a.totalQuestions) * 100;
    return Math.min(Math.max(percent, 0), 100);
  });
  const timeSpents = sortedAttempts.map(a => a.timeSpent || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Pontuação (%)',
        data: scores,
        borderColor: 'rgb(79, 70, 229)', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        yAxisID: 'y',
        tension: 0.4, // Para suavizar a linha
        fill: false,
      },
      {
        label: 'Tempo Gasto (segundos)',
        data: timeSpents,
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        yAxisID: 'y1',
        tension: 0.4, // Para suavizar a linha
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Evolução do Desempenho e Tempo Gasto',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Pontuação (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tempo Gasto (segundos)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <Line options={options} data={data} />
    </div>
  );
};

export default PerformanceChart;