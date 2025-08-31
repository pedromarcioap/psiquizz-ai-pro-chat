import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../utils/hooks';

const SettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
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
      if (authLoading || !user) return;
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('prompts')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116: no rows found
        if (data && data.prompts) {
          setPrompts(data.prompts);
        } else {
          // Valores padrão se não existirem prompts salvos
          const defaultPrompts = {
            quiz: `Gere um quizz em português do Brasil com as seguintes especificações:
- Tópico: {topic}
- Dificuldade: {difficulty}
- Número de questões: {numQuestions}
- Número de alternativas por questão: {numOptions}
{context}
Sua resposta DEVE ser um objeto JSON válido, sem nenhum texto ou formatação adicional. A estrutura deve ser:
{
  "questions": [
    {
      "question": "Texto da pergunta",
      "options": ["Alternativa 1", "Alternativa 2", "Alternativa 3", "Alternativa 4"],
      "correctAnswer": "A alternativa correta",
      "explanation": "Uma explicação didática e detalhada sobre a resposta correta, e por que as outras estão incorretas."
    }
  ]
}
Certifique-se de que "correctAnswer" seja idêntico a um dos valores em "options".`,
            tutor: `Seu nome é Phd Izy, e você é uma tutora e mentora. Analise o desempenho do aluno neste quiz.
Tópico: {question}

Resultados:
{results}

Forneça um feedback construtivo e personalizado. Destaque os pontos fortes e as áreas que precisam de melhoria. Sugira um plano de estudos simples, prático, didático e claro. Formate a resposta de forma clara e motivadora, usando títulos como "Feedback da Phd Izy" e "Seu Plano de Estudos".

Sua resposta DEVE ser em Markdown válido, com formatação e respiro.`,
            chat: `Você é Izy, uma mentora de IA amigável, motivadora e especialista em estudos com foco e conhecimento abundante em Psicologia, Sociologia, Filosofia e demais áreas. Responda às perguntas do usuário de forma clara, didática, empática e bem formatada, usando markdown (negrito, itálico, listas) para melhorar a legibilidade.

{context}

O usuário pergunta: {input}`
          };
          setPrompts(defaultPrompts);
        }
      } catch (err) {
        console.error('Erro ao carregar prompts:', err);
      }
    };

    loadPrompts();
  }, [user, authLoading]);

  // Função para salvar prompts
  const handleSavePrompts = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Upsert: atualiza se existe, insere se não existe
      const { error } = await supabase
        .from('settings')
        .upsert([
          {
            user_id: user.id,
            prompts: prompts
          }
        ], { onConflict: ['user_id'] });
      if (error) throw error;
      setSuccess('Prompts salvos com sucesso!');
    } catch (err) {
      setError('Erro ao salvar prompts: ' + err.message);
    }
    setLoading(false);
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
            disabled={loading || authLoading}
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Dicas de Uso e Variáveis Dinâmicas</h3>
        <p className="text-blue-700 mb-4">
          Para tornar seus prompts mais poderosos, você pode usar as seguintes variáveis. Elas serão substituídas automaticamente pelo sistema com as informações correspondentes.
        </p>
        <ul className="space-y-2 text-blue-700">
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{context}'}</code>: Utilizado para inserir o conteúdo completo do material de estudo.</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{input}'}</code>: Representa a pergunta ou o comando digitado pelo usuário.</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{question}'}</code>: Contém a pergunta específica de um item do quiz.</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{options}'}</code>: Insere as opções de múltipla escolha de uma pergunta.</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{answer}'}</code>: Fornece a resposta correta para uma pergunta do quiz.</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{results}'}</code>: Apresenta os resultados gerais do quiz (ex: pontuação, acertos).</li>
          <li><code className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">{'{performance}'}</code>: Oferece uma análise detalhada sobre o desempenho do aluno.</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;