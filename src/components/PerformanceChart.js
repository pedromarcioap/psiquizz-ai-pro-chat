import React from 'react';
// Em um projeto real, usaríamos uma biblioteca de gráficos como Chart.js ou Recharts.
// Por simplicidade, vamos simular o gráfico com divs.

const PerformanceChart = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return <p className="text-gray-500">Dados insuficientes para gerar o gráfico.</p>;
  }

  const scores = attempts.map(a => {
    if (!a || !a.totalQuestions || a.totalQuestions === 0) return 0;
    const percent = Math.round((a.score / a.totalQuestions) * 100);
    return Math.min(Math.max(percent, 0), 100);
  });
  const timeSpents = attempts.map(a => a.timeSpent || 0);

  // Encontrar o tempo máximo gasto para normalização
  const maxTimeSpent = Math.max(...timeSpents);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Evolução do Desempenho</h4>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Gráfico de Pontuação */}
        <div className="flex-1">
          <h5 className="text-md font-medium mb-2">Pontuação (%)</h5>
          <div className="flex items-end h-40 border-b border-gray-300">
            {scores.map((score, index) => (
              <div key={`score-${index}`} className="flex-1 flex flex-col items-center justify-end">
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

        {/* Gráfico de Tempo Gasto */}
        <div className="flex-1">
          <h5 className="text-md font-medium mb-2">Tempo Gasto (s)</h5>
          <div className="flex items-end h-40 border-b border-gray-300">
            {timeSpents.map((time, index) => (
              <div key={`time-${index}`} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-8 bg-green-500 hover:bg-green-600"
                  style={{ height: `${(time / maxTimeSpent) * 100}%` }} // Normaliza para a altura do gráfico
                  title={`Tentativa ${index + 1}: ${formatTime(time)}`}
                ></div>
                <span className="text-xs mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;