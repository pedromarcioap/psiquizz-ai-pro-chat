import React from 'react';

const TopicAnalysis = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return null;
  }

  const topicStats = attempts.reduce((acc, attempt) => {
    const topic = attempt.topic || 'Geral';
    if (!acc[topic]) {
      acc[topic] = { totalScore: 0, count: 0 };
    }
    acc[topic].totalScore += (attempt.score / attempt.totalQuestions) * 100;
    acc[topic].count += 1;
    return acc;
  }, {});

  const topicAverages = Object.entries(topicStats).map(([topic, data]) => ({
    topic,
    average: Math.round(data.totalScore / data.count),
  })).sort((a, b) => b.average - a.average);

  const bestTopic = topicAverages[0];
  const worstTopic = topicAverages[topicAverages.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800">Melhor Tópico</h4>
        <p className="text-lg font-bold text-green-700">{bestTopic ? bestTopic.topic : '-'}</p>
        <p className="text-sm text-green-600">Média de {bestTopic ? bestTopic.average : '-'}%</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-semibold text-red-800">Tópico a Melhorar</h4>
        <p className="text-lg font-bold text-red-700">{worstTopic ? worstTopic.topic : '-'}</p>
        <p className="text-sm text-red-600">Média de {worstTopic ? worstTopic.average : '-'}%</p>
      </div>
    </div>
  );
};

export default TopicAnalysis;