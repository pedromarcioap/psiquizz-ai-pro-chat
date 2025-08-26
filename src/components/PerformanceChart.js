
import React from 'react';
import LineChart from './LineChart';

const PerformanceChart = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return <p className="text-gray-500">Dados insuficientes para gerar o gráfico.</p>;
  }

  // Prepara dados para o gráfico
  const chartData = attempts.map((a, idx) => ({
    tentativa: a.attemptedAt ? new Date(a.attemptedAt).toLocaleString('pt-BR') : `Tentativa ${idx + 1}`,
    pontuacao: a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0,
    tempo: a.timeSpent || 0,
  }));

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Evolução do Desempenho</h4>
      <LineChart
        data={chartData}
        dataKey="pontuacao"
        nameKey="tentativa"
        color="#6366f1"
        label="Pontuação (%)"
      />
      <LineChart
        data={chartData}
        dataKey="tempo"
        nameKey="tentativa"
        color="#10b981"
        label="Tempo Gasto (s)"
      />
    </div>
  );
};

export default PerformanceChart;