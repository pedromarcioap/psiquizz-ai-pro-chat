import React from 'react';
// Em um projeto real, usaríamos uma biblioteca de gráficos como Chart.js ou Recharts.
// Por simplicidade, vamos simular o gráfico com divs.

const PerformanceChart = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return <p className="text-gray-500">Dados insuficientes para gerar o gráfico.</p>;
  }

  const scores = attempts.map(a => Math.round((a.score / a.totalQuestions) * 100));

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Evolução do Desempenho</h4>
      <div className="flex items-end h-40 border-b border-gray-300">
        {scores.map((score, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end">
            <div
              className="w-8 bg-indigo-500 hover:bg-indigo-600"
              style={{ height: `${score}%` }}
              title={`Tentativa ${index + 1}: ${score}%`}
            ></div>
            <span className="text-xs mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceChart;