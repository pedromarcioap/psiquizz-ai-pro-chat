import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../utils/hooks';
import { useNavigate, useLocation } from 'react-router-dom';

const QuizGeneratorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Adicionado useLocation
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quizConfig, setQuizConfig] = useState({
    topic: '',
    subtopics: '',
    difficulty: 'medium',
    numQuestions: 5,
    numOptions: 4
  });
  const [generatedQuiz, setGeneratedQuiz] = useState({ questions: [] });
  const [quizMode, setQuizMode] = useState('prova'); // 'prova' ou 'teste'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados do modo de estudo
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // Novo estado para controlar o início do quiz

  // Função para iniciar o quiz
  const startQuiz = (quizData) => {
    setGeneratedQuiz(quizData);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    if (quizMode === 'prova') {
      const timePerQuestion = 60;
      setTimeLeft(quizData.questions.length * timePerQuestion);
      setIsTimerActive(true);
    } else {
      setTimeLeft(null);
      setIsTimerActive(false);
    }
    setQuizStarted(true);
  };

  // Carregar materiais da biblioteca e/ou quiz da URL
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Carregar materiais
      try {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'library'));
        const materialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(materialsData);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
      }

      // Carregar quiz da URL, se houver
      const params = new URLSearchParams(location.search);
      const quizIdFromUrl = params.get('quizId');

      if (quizIdFromUrl) {
        try {
          const quizDocRef = doc(db, 'users', user.uid, 'quizzes', quizIdFromUrl);
          const quizDocSnap = await getDoc(quizDocRef);
          if (quizDocSnap.exists()) {
            const quizData = { id: quizDocSnap.id, ...quizDocSnap.data(), createdAt: quizDocSnap.data().createdAt?.toDate() };
            console.log("QuizGeneratorPage: Quiz carregado da URL:", quizData);
            // Garantir que quizData tenha a propriedade questions
            const quizDataWithQuestions = { questions: [], ...quizData };
            setGeneratedQuiz(quizDataWithQuestions);
            setQuizConfig(prev => ({
              ...prev,
              topic: quizDataWithQuestions.topic,
              difficulty: quizDataWithQuestions.difficulty,
              numQuestions: quizDataWithQuestions.questions?.length || 0,
            }));
            // Iniciar o quiz automaticamente se for carregado da URL
            startQuiz(quizDataWithQuestions);
          } else {
            console.warn("QuizGeneratorPage: Quiz não encontrado na URL:", quizIdFromUrl);
          }
        } catch (err) {
          console.error('QuizGeneratorPage: Erro ao carregar quiz da URL:', err);
        }
      }
    };

    loadData();
  }, [user, location.search]);

  // Efeito para o cronômetro
  useEffect(() => {
    if (!isTimerActive || timeLeft === null || !quizStarted) return;

    if (timeLeft === 0) {
      setIsTimerActive(false);
      // Finaliza o quiz automaticamente
      setCurrentQuestionIndex(generatedQuiz.questions.length);
      handleSaveAttempt();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isTimerActive, timeLeft, quizStarted, generatedQuiz]);

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
    setGeneratedQuiz(null); // Resetar quiz gerado
    setQuizStarted(false); // Resetar estado de quiz iniciado
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setTimeLeft(null);
    setIsTimerActive(false);

    try {
      // Monta preferências para o backend
      const preferences = {
        ...quizConfig,
        material: selectedMaterial ? materials.find(m => m.id === selectedMaterial)?.content : undefined
      };
      // Chamada ao backend para quiz otimizado
      console.log("Tentando obter token do usuário...");
      const token = await user.getIdToken();
      console.log("Token obtido:", token ? "Token presente" : "Token ausente");
      console.log("Preferências enviadas:", preferences);
  const response = await fetch('https://reimagined-journey-p74p4vr7g75279w7-4000.app.github.dev/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
      });
      console.log("Resposta do backend:", response);
      const data = await response.json();
      let quizObj = null;
      try {
        quizObj = typeof data.quiz === 'string' ? JSON.parse(data.quiz) : data.quiz;
      } catch (err) {
        setError('Erro ao interpretar resposta do backend. Tente novamente.');
        setLoading(false);
        return;
      }
      setGeneratedQuiz(quizObj);
      setAnswers([]);
      if (quizMode === 'prova') {
        const timePerQuestion = 60; // 60 segundos por questão
        setTimeLeft(quizObj.questions.length * timePerQuestion);
        setIsTimerActive(true);
      } else {
        setTimeLeft(null);
        setIsTimerActive(false);
      }
      setQuizStarted(true);
      setLoading(false);
    } catch (err) {
      setError('Erro ao gerar quiz: ' + err.message);
      setLoading(false);
    }
  }

  // Função para lidar com a seleção de uma opção
  const handleOptionSelect = (option) => {
    if (showExplanation) return; // Não permitir mudar a resposta após ver a explicação
    setSelectedOption(option);
  };

  // Função para ir para a próxima pergunta
  const handleNextQuestion = () => {
    if (selectedOption === null) {
      alert('Por favor, selecione uma opção antes de continuar.');
      return;
    }

    // Verificar se a resposta está correta
    const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Atualizar pontuação e respostas
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    const newAnswer = {
      question: currentQuestion.question,
      selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Mostrar explicação
    setShowExplanation(true);
  };

  // Função para ir para a próxima pergunta ou finalizar
  const handleContinue = () => {
    if (currentQuestionIndex < generatedQuiz.questions.length - 1) {
      // Ir para a próxima pergunta
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finalizar quiz
      handleSaveAttempt();
      setShowExplanation(false);
      setIsTimerActive(false);
    }
  };

  const handleSaveAttempt = async () => {
    if (!user || !generatedQuiz) return;
    const timePerQuestion = 60;
    const totalTime = generatedQuiz.questions.length * timePerQuestion;
    const timeSpent = totalTime - (timeLeft || 0); // Usar 0 se timeLeft for nulo

    const finalScore = answers.filter(answer => answer.isCorrect).length; // Recalcular score com base nas respostas

    const attemptData = {
      quizId: generatedQuiz.id || `generated-${Timestamp.now().toMillis()}`, // Gerar um ID se não houver
      topic: quizConfig.topic,
      difficulty: quizConfig.difficulty,
      score: finalScore, // Usar o score recalculado
      totalQuestions: generatedQuiz.questions.length,
      attemptedAt: Timestamp.now(),
      timeSpent,
      answers,
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'quizAttempts'), attemptData);
      alert('Tentativa de quiz salva com sucesso!');
    } catch (err) {
      setError('Erro ao salvar a tentativa de quiz: ' + err.message);
    }
  };

  // Função para reiniciar o quiz
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    const timePerQuestion = 60;
    setTimeLeft(generatedQuiz.questions.length * timePerQuestion);
    setIsTimerActive(true);
    setQuizStarted(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = generatedQuiz?.questions[currentQuestionIndex];
  const progress = generatedQuiz ? ((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100 : 0;

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
        // Renderização do quiz
        <div className="bg-white shadow rounded-lg p-6">
          {!quizStarted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Gerado!</h2>
              <p className="text-gray-700 mb-6">Tópico: {quizConfig.topic}</p>
              <div className="mb-4 flex justify-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="quizMode"
                    value="prova"
                    checked={quizMode === 'prova'}
                    onChange={() => setQuizMode('prova')}
                  />
                  Modo Prova
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="quizMode"
                    value="teste"
                    checked={quizMode === 'teste'}
                    onChange={() => setQuizMode('teste')}
                  />
                  Modo Teste
                </label>
              </div>
              <button
                onClick={() => startQuiz(generatedQuiz)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Iniciar Quiz
              </button>
              <button
                onClick={() => setGeneratedQuiz(null)}
                className="ml-4 inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Gerar Novo Quiz
              </button>
            </div>
          ) : currentQuestionIndex >= generatedQuiz.questions.length ? (
            // Tela de resultados finais
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Quiz Concluído!</h2>
              
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {score}/{generatedQuiz.questions.length}
                </div>
                <div className="text-lg text-gray-700">
                  Pontuação: {Math.round((score/generatedQuiz.questions.length)*100)}%
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-gray-900">Respostas:</h3>
                {answers.map((answer, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <h4 className="font-medium text-gray-900 mb-2">{answer.question}</h4>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Sua resposta:</span> {answer.selectedOption} 
                      {answer.isCorrect ? ' ✓' : ' ✗'}
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Resposta correta:</span> {answer.correctAnswer}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-semibold">Explicação:</span> {answer.explanation}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refazer Quiz
                </button>
                <button
                  onClick={() => setGeneratedQuiz(null)} // Voltar para a tela de geração
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Gerar Novo Quiz
                </button>
              </div>
            </div>
          ) : (
            // Tela de pergunta
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>Pergunta {currentQuestionIndex + 1} de {generatedQuiz.questions.length}</span>
                  <span className="font-semibold text-lg text-gray-800">{formatTime(timeLeft)}</span>
                  <span>Pontuação: {score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion?.question}
                </h2>
                
                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedOption === option 
                          ? showExplanation && option === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50' 
                            : showExplanation && option !== currentQuestion.correctAnswer && selectedOption === option
                              ? 'border-red-500 bg-red-50'
                              : 'border-indigo-500 bg-indigo-50'
                          : showExplanation && option === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:bg-gray-50'
                      } ${
                        showExplanation && option === currentQuestion.correctAnswer ? 'font-semibold' : ''
                      }`}
                    >
                      {option}
                      {showExplanation && option === currentQuestion.correctAnswer && (
                        <span className="ml-2 text-green-600">✓ Resposta correta</span>
                      )}
                      {showExplanation && option !== currentQuestion.correctAnswer && selectedOption === option && (
                        <span className="ml-2 text-red-600">✗ Sua resposta</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Explicação:</h3>
                  <p className="text-gray-700">{currentQuestion?.explanation}</p>
                </div>
              )}
              
              <div className="flex justify-center">
                {!showExplanation ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Verificar Resposta
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {currentQuestionIndex < generatedQuiz.questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGeneratorPage;