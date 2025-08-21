import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const QuizGeneratorPage = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quizConfig, setQuizConfig] = useState({
    topic: '',
    subtopics: '',
    difficulty: 'medium',
    numQuestions: 5,
    numOptions: 4
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Carregar materiais da biblioteca
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'));
        const materialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(materialsData);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
      }
    };

    loadMaterials();
  }, []);

  // Função para lidar com mudanças no formulário
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setQuizConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para gerar o quiz
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Construir o prompt para a IA
      let prompt = `Gere um quiz educacional com as seguintes especificações:
      Tópico: ${quizConfig.topic}
      Subtópicos: ${quizConfig.subtopics}
      Dificuldade: ${quizConfig.difficulty}
      Número de questões: ${quizConfig.numQuestions}
      Número de opções por questão: ${quizConfig.numOptions}
      
      Forneça a resposta no formato JSON com a seguinte estrutura:
      {
        "questions": [
          {
            "question": "Texto da pergunta",
            "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
            "correctAnswer": "Opção correta",
            "explanation": "Explicação didática da resposta"
          }
        ]
      }`;

      // Se um material foi selecionado, incluir seu conteúdo no prompt
      if (selectedMaterial) {
        const material = materials.find(m => m.id === selectedMaterial);
        if (material) {
          prompt += `\n\nConteúdo do material para basear o quiz:\n${material.content.substring(0, 1000)}...`;
        }
      }

      // Chamar a API Gemini
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Usar modelo mais recente
      
      // Adicionar tratamento de erro mais detalhado
      let text;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        
        // Verificar se a resposta é válida
        if (!text || text.trim() === '') {
          throw new Error('Resposta vazia da API Gemini');
        }
      } catch (apiError) {
        console.error('Erro específico da API Gemini:', apiError);
        throw new Error(`Falha na comunicação com a API Gemini: ${apiError.message}`);
      }
      
      // Tentar parsear o JSON da resposta
      let quizData;
      try {
        // Remover possíveis delimitadores de código
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(jsonStart, jsonEnd);
        quizData = JSON.parse(jsonString);
      } catch (parseError) {
        throw new Error('Falha ao parsear o JSON da resposta da IA');
      }

      setGeneratedQuiz(quizData);
      setLoading(false);
    } catch (err) {
      setError('Erro ao gerar quiz: ' + err.message);
      setLoading(false);
    }
  };

  // Função para salvar o quiz gerado
  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return;

    try {
      await addDoc(collection(db, 'quizHistory'), {
        topic: quizConfig.topic,
        difficulty: quizConfig.difficulty,
        questions: generatedQuiz.questions,
        timestamp: Timestamp.fromDate(new Date())
      });

      alert('Quiz salvo com sucesso!');
    } catch (err) {
      setError('Erro ao salvar quiz: ' + err.message);
    }
  };

  // Função para lidar com a seleção de resposta
  const handleAnswerSelection = (questionIndex, selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  // Função para verificar as respostas
  const handleCheckAnswers = () => {
    setShowResults(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gerador de Quizzes</h1>
      
      {!generatedQuiz ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações do Quiz</h2>
          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tópico
              </label>
              <input
                type="text"
                name="topic"
                value={quizConfig.topic}
                onChange={handleConfigChange}
                required
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Ex: História do Brasil"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtópicos (opcional)
              </label>
              <input
                type="text"
                name="subtopics"
                value={quizConfig.subtopics}
                onChange={handleConfigChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Ex: Período Colonial, República Velha"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificuldade
                </label>
                <select
                  name="difficulty"
                  value={quizConfig.difficulty}
                  onChange={handleConfigChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº de Questões
                </label>
                <input
                  type="number"
                  name="numQuestions"
                  value={quizConfig.numQuestions}
                  onChange={handleConfigChange}
                  min="1"
                  max="20"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº de Alternativas
                </label>
                <input
                  type="number"
                  name="numOptions"
                  value={quizConfig.numOptions}
                  onChange={handleConfigChange}
                  min="2"
                  max="6"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basear em Material da Biblioteca (opcional)
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              >
                <option value="">Selecione um material</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar Quiz'}
              </button>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quiz Gerado: {quizConfig.topic}</h2>
            <button
              onClick={handleSaveQuiz}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Salvar Quiz
            </button>
          </div>
          
          <div className="space-y-6">
            {generatedQuiz.questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {index + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = userAnswers[index] === option;
                    const isCorrect = question.correctAnswer === option;
                    let buttonClass = 'w-full text-left p-2 rounded-md border';

                    if (showResults) {
                      if (isCorrect) {
                        buttonClass += ' bg-green-100 border-green-300 text-green-800';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += ' bg-red-100 border-red-300 text-red-800';
                      } else {
                        buttonClass += ' bg-gray-50 border-gray-200';
                      }
                    } else {
                      buttonClass += isSelected ? ' bg-indigo-100 border-indigo-300' : ' bg-white hover:bg-gray-50';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => !showResults && handleAnswerSelection(index, option)}
                        className={buttonClass}
                        disabled={showResults}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {showResults && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">Resposta correta:</span> {question.correctAnswer}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">Explicação:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex space-x-4">
            {!showResults ? (
              <button
                onClick={handleCheckAnswers}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verificar Respostas
              </button>
            ) : (
              <button
                onClick={() => {
                  setGeneratedQuiz(null);
                  setUserAnswers({});
                  setShowResults(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Gerar Novo Quiz
              </button>
            )}
            <button
              onClick={handleSaveQuiz}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Salvar Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGeneratorPage;