import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SettingsPage = () => {
  const [prompts, setPrompts] = useState({
    quiz: '',
    tutor: '',
    chat: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Carregar prompts atuais
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const docRef = doc(db, 'settings', 'prompts');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPrompts(docSnap.data());
        } else {
          // Valores padrão se não existirem prompts salvos
          const defaultPrompts = {
            quiz: 'Você é um gerador de quizzes educacionais. Crie perguntas de múltipla escolha com base no tópico fornecido. Forneça 4 opções e indique a resposta correta.',
            tutor: 'Você é uma tutora especialista em análise de desempenho acadêmico. Analise os resultados do quiz e forneça feedback personalizado para ajudar o aluno a melhorar.',
            chat: 'Você é Izy, uma mentora de estudos inteligente e amigável. Ajude o usuário com suas dúvidas sobre os materiais de estudo. Seja didática e forneça explicações claras.'
          };
          setPrompts(defaultPrompts);
        }
      } catch (err) {
        console.error('Erro ao carregar prompts:', err);
      }
    };

    loadPrompts();
  }, []);

  // Função para salvar prompts
  const handleSavePrompts = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await setDoc(doc(db, 'settings', 'prompts'), prompts);
      
      setSuccess('Prompts salvos com sucesso!');
      setLoading(false);
    } catch (err) {
      setError('Erro ao salvar prompts: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações de IA</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Personalizar Prompts</h2>
        <p className="text-gray-600 mb-6">
          Edite os prompts abaixo para personalizar o comportamento da IA em diferentes partes do aplicativo.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt do Gerador de Quizz
            </label>
            <textarea
              value={prompts.quiz}
              onChange={(e) => setPrompts({...prompts, quiz: e.target.value})}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Digite o prompt para o gerador de quizzes..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt do Tutor de Análise de Resultados
            </label>
            <textarea
              value={prompts.tutor}
              onChange={(e) => setPrompts({...prompts, tutor: e.target.value})}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Digite o prompt para o tutor de análise de resultados..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt da Mentora Izy (Chat)
            </label>
            <textarea
              value={prompts.chat}
              onChange={(e) => setPrompts({...prompts, chat: e.target.value})}
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Digite o prompt para a mentora Izy..."
            />
          </div>
        </div>
        
        <div className="mt-6 flex items-center">
          <button
            onClick={handleSavePrompts}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Prompts'}
          </button>
          
          {success && (
            <div className="ml-4 text-green-600 text-sm">{success}</div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Dica de Uso</h3>
        <p className="text-blue-700">
          Os prompts personalizados serão usados em tempo real pelo aplicativo. 
          Você pode incluir variáveis como {context} e {input} que serão substituídas 
          dinamicamente pelo sistema com informações relevantes.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;