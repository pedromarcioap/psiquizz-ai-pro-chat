import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const StudyModePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Carregar quizzes do histórico
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizHistory'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setQuizzes(quizzesData);
      } catch (err) {
        console.error('Erro ao carregar quizzes:', err);
      }
    };

    loadQuizzes();
  }, []);

  // Função para iniciar o modo de estudo
  const startStudyMode = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
  };

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
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
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
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      // Ir para a próxima pergunta
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finalizar quiz
      setShowExplanation(false);
    }
  };

  // Função para reiniciar o quiz
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
  };

  // Função para voltar à seleção de quizzes
  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
  };

  if (!selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Modo de Estudo</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Selecione um Quiz para Estudar</h2>
          
          {quizzes.length === 0 ? (
            <p className="text-gray-500">Nenhum quiz disponível. Gere um quiz primeiro.</p>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{quiz.topic}</h3>
                    <p className="text-sm text-gray-500">
                      {quiz.questions?.length} perguntas • Dificuldade: {quiz.difficulty}
                    </p>
                    <p className="text-sm text-gray-500">
                      Criado em: {quiz.timestamp?.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => startStudyMode(quiz)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Estudar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modo de Estudo</h1>
        <button
          onClick={handleBackToQuizzes}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar aos Quizzes
        </button>
      </div>
      
      {currentQuestionIndex >= selectedQuiz.questions.length ? (
        // Tela de resultados finais
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Quiz Concluído!</h2>
          
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {score}/{selectedQuiz.questions.length}
            </div>
            <div className="text-lg text-gray-700">
              Pontuação: {Math.round((score/selectedQuiz.questions.length)*100)}%
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
                  <span className="font-medium">Explicação:</span> {answer.explanation}
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
              onClick={handleBackToQuizzes}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar aos Quizzes
            </button>
          </div>
        </div>
      ) : (
        // Tela de pergunta
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Pergunta {currentQuestionIndex + 1} de {selectedQuiz.questions.length}</span>
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
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
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
              <p className="text-gray-700">{currentQuestion.explanation}</p>
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
                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyModePage;