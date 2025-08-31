// Função utilitária para exportar dados em CSV
function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(',')];
  for (const row of data) {
    csvRows.push(keys.map(k => JSON.stringify(row[k] ?? '')).join(','));
  }
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
// Mock de fallback IA local
import { getLocalEmbedding } from '../utils/embeddings';
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/hooks';
import PerformanceChart from '../components/PerformanceChart';
import { getAllLocal, saveLocalFirst, flushToFirestore } from '../utils/storage';
import { compress, decompress } from 'lz-string';
import TopicAnalysis from '../components/TopicAnalysis';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    averageScore: 0,
    quizzesTaken: 0,
    totalQuestions: 0,
  });
  const [bestTopic, setBestTopic] = useState(null); // Novo estado para o melhor tópico
  const [worstTopic, setWorstTopic] = useState(null); // Novo estado para o pior tópico
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]); // Novo estado para todas as tentativas
  const [generatedQuizzes, setGeneratedQuizzes] = useState([]); // Novo estado para quizzes gerados
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState('');

  const PAGE_SIZE = 5; // Configuração de paginação
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Carregar tentativas do Supabase
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_history')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });
        if (attemptsError) throw attemptsError;

        // Calcula estatísticas
        let totalQuestions = 0;
        let totalScore = 0;
        (attemptsData || []).forEach(attempt => {
          totalQuestions += attempt.perguntas?.length || 0;
          totalScore += attempt.pontuação || 0;
        });
        // Calcula estatísticas
        const averageScore = (attemptsData && attemptsData.length > 0)
          ? Math.round((totalScore / (attemptsData.length || 1)) * 100) / 100
          : 0;
        const newStats = {
          averageScore,
          quizzesTaken: attemptsData.length,
          totalQuestions,
        };
        setStats(newStats);
        getStudyInsights(attemptsData, newStats);
        setRecentAttempts(attemptsData.slice(0, 3));
        setAllAttempts(attemptsData);
        // Carregar quizzes gerados do Supabase (ajuste conforme tabela real)
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('generated_quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });
        if (quizzesError) throw quizzesError;
        setGeneratedQuizzes(quizzesData || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading]);


  const getStudyInsights = async (attempts, currentStats) => {
    if (attempts.length < 3) {
      setInsights("Continue estudando para receber insights mais detalhados.");
      return;
    }

    // Chamada ao backend para insights otimizados
    try {
      // Obtém token do Firebase Auth
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:4000/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ attempts, stats: currentStats }),
      });
      const data = await response.json();
      if (data.insight) {
        setInsights(`${data.insight}\n\nFonte: ${data.source === 'cache' ? 'Cache' : 'Gemini'}`);
      } else {
        setInsights("Não foi possível gerar insights automáticos. Tente novamente mais tarde.");
      }
    } catch (err) {
      setInsights("Erro ao conectar ao backend de insights.");
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setInsights(response.text());
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => exportToCSV(allAttempts, 'tentativas_quiz.csv')}
        >Exportar Tentativas (CSV)</button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => exportToCSV(generatedQuizzes, 'quizzes_gerados.csv')}
        >Exportar Quizzes (CSV)</button>
      </div>
      
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
        ) : recentAttempts.length === 0 ? (
          <p className="text-gray-500">Nenhuma tentativa de quiz registrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {recentAttempts.map((attempt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{attempt.topic}</h3>
                  <span className="text-sm text-gray-500">
                    {attempt.attemptedAt?.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Pontuação: {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Análise de Desempenho */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Análise de Desempenho</h2>
        {allAttempts.length > 0 ? (
          <>
            <PerformanceChart attempts={allAttempts} />
            <div className="mt-4">
              <TopicAnalysis attempts={allAttempts} />
            </div>
          </>
        ) : (
          <p className="text-gray-500">Realize alguns quizzes para ver sua análise de desempenho.</p>
        )}
      </div>

      {/* Quizzes Gerados */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Seus Quizzes Gerados</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : generatedQuizzes.length === 0 ? (
          <p className="text-gray-500">Nenhum quiz gerado ainda. Crie um novo quiz!</p>
        ) : (
          <div className="space-y-4">
            {generatedQuizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{quiz.topic}</h3>
                  <p className="text-sm text-gray-500">
                    {quiz.questions?.length} perguntas • Dificuldade: {quiz.difficulty}
                  </p>
                  <p className="text-sm text-gray-500">
                    Criado em: {quiz.createdAt?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {/* Link para o modo de estudo */}
                <Link
                  to={`/study-mode?quizId=${quiz.id}`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Estudar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recomendação do Dia */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Plano de Estudos Inteligente</h2>
        <div className="bg-highlight p-4 rounded-lg">
          {insights ? (
            <p className="text-gray-800 whitespace-pre-wrap">{insights}</p>
          ) : (
            <p className="text-gray-500">Gerando insights...</p>
          )}
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