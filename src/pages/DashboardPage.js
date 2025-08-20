import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    averageScore: 0,
    quizzesTaken: 0,
    totalQuestions: 0
  });
  
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Carregar estatísticas do usuário (simuladas por enquanto)
        setStats({
          averageScore: 75,
          quizzesTaken: 12,
          totalQuestions: 120
        });

        // Carregar quizzes recentes
        const q = query(collection(db, 'quizHistory'), orderBy('timestamp', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setRecentQuizzes(quizzesData);

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Média de Acertos</h3>
          <p className="text-3xl font-bold text-primary">{stats.averageScore}%</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quizzes Realizados</h3>
          <p className="text-3xl font-bold text-primary">{stats.quizzesTaken}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Questões</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalQuestions}</p>
        </div>
      </div>
      
      {/* Atividades Recentes */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Atividades Recentes</h2>
          <Link to="/study-mode" className="text-sm text-indigo-600 hover:text-indigo-800">
            Ver todos
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recentQuizzes.length === 0 ? (
          <p className="text-gray-500">Nenhum quiz realizado ainda.</p>
        ) : (
          <div className="space-y-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{quiz.topic}</h3>
                  <span className="text-sm text-gray-500">
                    {quiz.timestamp?.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Pontuação: {quiz.score}/{quiz.totalQuestions} ({Math.round((quiz.score/quiz.totalQuestions)*100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recomendação do Dia */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recomendação do Dia</h2>
        <div className="bg-highlight p-4 rounded-lg">
          <p className="text-gray-800">
            <span className="font-semibold">Dica de Estudo:</span> Revise regularmente os conceitos que você teve mais dificuldade. 
            A repetição espaçada é uma técnica comprovada para melhorar a retenção de longo prazo.
          </p>
        </div>
      </div>
      
      {/* Links Rápidos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Links Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/library" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">📚</div>
            <span className="font-medium text-gray-900">Biblioteca</span>
          </Link>
          <Link to="/quiz-generator" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <span className="font-medium text-gray-900">Novo Quizz</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <span className="font-medium text-gray-900">Chat com Izy</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;