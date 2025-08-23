import React from 'react';

const TopicAnalysis = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return null;
  }

  const topicStats = attempts.reduce((acc, attempt) => {
    const topic = attempt.topic || 'Geral';
    if (!acc[topic]) {
      acc[topic] = { totalScore: 0, scoreCount: 0, totalTime: 0, timeCount: 0 };
    }
    
    // Estatísticas de pontuação
    const percent = (attempt.score / attempt.totalQuestions) * 100;
    acc[topic].totalScore += Math.min(Math.max(percent, 0), 100);
    acc[topic].scoreCount += 1;

    // Estatísticas de tempo
    if (attempt.timeSpent !== undefined && attempt.timeSpent !== null) {
      acc[topic].totalTime += attempt.timeSpent;
      acc[topic].timeCount += 1;
    }
    
    return acc;
  }, {});

  const topicAverages = Object.entries(topicStats).map(([topic, data]) => ({
    topic,
    averageScore: data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : 0,
    averageTime: data.timeCount > 0 ? Math.round(data.totalTime / data.timeCount) : 0,
  }));

  // Ordenar por pontuação
  const sortedByScore = [...topicAverages].sort((a, b) => b.averageScore - a.averageScore);
  const top5Scores = sortedByScore.slice(0, 5);
  const worst5Scores = sortedByScore.slice(-5).reverse(); // Piores 5, em ordem crescente

  // Ordenar por tempo (menor tempo é melhor)
  const sortedByTime = [...topicAverages].sort((a, b) => a.averageTime - b.averageTime);
  const top5Times = sortedByTime.slice(0, 5);
  const worst5Times = sortedByTime.slice(-5).reverse(); // Piores 5, em ordem decrescente

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Melhores Tópicos por Pontuação */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Top 5 Tópicos (Pontuação)</h4>
        {top5Scores.length > 0 ? (
          <ul className="list-disc list-inside">
            {top5Scores.map((item, index) => (
              <li key={index} className="text-sm text-green-700">
                {item.topic}: {item.averageScore}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum dado de pontuação disponível.</p>
        )}
      </div>

      {/* Piores Tópicos por Pontuação */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">5 Tópicos a Melhorar (Pontuação)</h4>
        {worst5Scores.length > 0 ? (
          <ul className="list-disc list-inside">
            {worst5Scores.map((item, index) => (
              <li key={index} className="text-sm text-red-700">
                {item.topic}: {item.averageScore}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum dado de pontuação disponível.</p>
        )}
      </div>

      {/* Melhores Tópicos por Tempo */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Top 5 Tópicos (Tempo)</h4>
        {top5Times.length > 0 ? (
          <ul className="list-disc list-inside">
            {top5Times.map((item, index) => (
              <li key={index} className="text-sm text-blue-700">
                {item.topic}: {item.averageTime}s
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum dado de tempo disponível.</p>
        )}
      </div>

      {/* Piores Tópicos por Tempo */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-semibold text-orange-800 mb-2">5 Tópicos a Melhorar (Tempo)</h4>
        {worst5Times.length > 0 ? (
          <ul className="list-disc list-inside">
            {worst5Times.map((item, index) => (
              <li key={index} className="text-sm text-orange-700">
                {item.topic}: {item.averageTime}s
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum dado de tempo disponível.</p>
        )}
      </div>
    </div>
  );
};

export default TopicAnalysis;