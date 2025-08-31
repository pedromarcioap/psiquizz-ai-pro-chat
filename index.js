import React, { useState, useEffect, useMemo } from 'react';

// --- Importações do Firebase ---
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs, 
    query,
    deleteDoc,
    orderBy,
    Timestamp
} from 'firebase/firestore';


// --- Configuração do Firebase ---
// Supabase configuration is handled in src/services/supabaseClient.js

// Inicializa o Firebase e exporta os serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- Ícones SVG ---
const BrainIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.871 14.735c-1.32.253-2.37.882-2.37 1.62 0 .939 1.567 1.701 3.5 1.701s3.5-.762 3.5-1.701c0-.738-1.05-1.367-2.37-1.62m-1.13 0a23.94 23.94 0 01-4-6.235C1.3 7.229 1 5.942 1 4.5 1 2.567 2.567 1 4.5 1s3.5 1.567 3.5 3.5c0 1.442-.3 2.729-.871 3.999a23.942 23.942 0 01-4 6.236m-1.13 0v2.13c0 .939 1.567 1.701 3.5 1.701s3.5-.762 3.5-1.701v-2.13m-3.5 0h.01M12 21.5c0 .939 1.567 1.701 3.5 1.701s3.5-.762 3.5-1.701c0-.738-1.05-1.367-2.37-1.62m-1.13 0a23.94 23.94 0 004-6.235c.571-1.27.871-2.557.871-3.999 0-1.933-1.567-3.5-3.5-3.5s-3.5 1.567-3.5 3.5c0 1.442.3 2.729.871 3.999a23.942 23.942 0 004 6.236m-1.13 0v2.13c0 .939 1.567 1.701 3.5 1.701s3.5-.762 3.5-1.701v-2.13m-3.5 0h.01M12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg> );
const BookOpenIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> );
const PlusCircleIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const UploadIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> );
const CheckCircleIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const XCircleIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const LightBulbIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> );
const ArrowLeftIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg> );
const CogIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" /></svg> );
const LogoutIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg> );
const GoogleIcon = ({ className = "w-5 h-5" }) => ( <svg className={className} viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.599 32.656 48 27.461 48 20c0-1.341-.138-2.65-.389-3.917z"></path></svg> );
const ChatBubbleIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.372A5.569 5.569 0 006 21.083" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const PaperAirplaneIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg> );
const TrashIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> );


// --- Componentes da UI ---
const Modal = ({ title, children, onClose }) => ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all animate-fade-in-up"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div>{children}</div></div></div> );
const Loader = ({ text }) => ( <div className="flex flex-col items-center justify-center space-y-4 p-8"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div><p className="text-lg text-gray-600 font-semibold">{text}</p></div> );

// --- Componentes das Páginas ---

const Header = ({ onNavigate, user, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <a onClick={() => onNavigate('home')} className="flex items-center space-x-2 cursor-pointer">
            <BrainIcon className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800 tracking-tight">PsiQuizz AI</span>
          </a>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <a onClick={() => onNavigate('home')} className="hidden sm:block text-gray-600 hover:text-blue-500 font-medium transition-colors cursor-pointer">Dashboard</a>
            <a onClick={() => onNavigate('chat')} className="hidden sm:block text-gray-600 hover:text-blue-500 font-medium transition-colors cursor-pointer">Chat</a>
            <a onClick={() => onNavigate('quizSetup')} className="hidden sm:block text-gray-600 hover:text-blue-500 font-medium transition-colors cursor-pointer">Novo Quizz</a>
            <a onClick={() => onNavigate('library')} className="hidden sm:block text-gray-600 hover:text-blue-500 font-medium transition-colors cursor-pointer">Biblioteca</a>
            <a onClick={() => onNavigate('settings')} className="text-gray-600 hover:text-blue-500 font-medium transition-colors cursor-pointer flex items-center space-x-1"><CogIcon className="w-5 h-5" /> <span className="hidden sm:inline">Configurações</span></a>
            <button onClick={onLogout} className="text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer flex items-center space-x-1"><LogoutIcon className="w-5 h-5" /> <span className="hidden sm:inline">Sair</span></button>
          </div>
        )}
      </div>
    </nav>
  </header>
);

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ backgroundColor: '#F0F8FF' }}>
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{isLogin ? 'Login' : 'Criar Conta'}</h1>
                    <p className="text-gray-500">Bem-vindo ao PsiQuizz AI</p>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
                
                <button onClick={handleGoogleSignIn} disabled={loading} className="w-full mb-4 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 disabled:bg-gray-200">
                    <GoogleIcon />
                    <span>Entrar com Google</span>
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OU</span>
                    </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                        {loading ? 'Carregando...' : (isLogin ? 'Entrar com Email' : 'Registrar com Email')}
                    </button>
                </form>
                <p className="text-center mt-4">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline">
                        {isLogin ? 'Não tem uma conta? Crie uma agora.' : 'Já tem uma conta? Faça login.'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const HomePage = ({ onNavigate, quizHistory }) => {
  const performanceSummary = useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) { return { averageScore: 0, quizzesTaken: 0, totalQuestions: 0, correctAnswers: 0 }; }
    const totalQuizzes = quizHistory.length;
    const totalQuestions = quizHistory.reduce((sum, q) => sum + q.questions.length, 0);
    const correctAnswers = quizHistory.reduce((sum, q) => sum + q.score, 0);
    const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    return { averageScore, quizzesTaken: totalQuizzes, totalQuestions, correctAnswers };
  }, [quizHistory]);

  const recentActivities = quizHistory ? quizHistory.slice(-3).reverse() : [];

  return ( <div className="animate-fade-in space-y-8"><div className="text-center"><h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Seu Dashboard de Estudos</h1><p className="mt-2 text-lg text-gray-600">Acompanhe seu progresso e descubra novos desafios.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center"><h3 className="text-lg font-semibold text-gray-500">Média de Acertos</h3><p className="text-4xl font-bold text-blue-500 mt-2">{performanceSummary.averageScore}%</p></div><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center"><h3 className="text-lg font-semibold text-gray-500">Quizzes Realizados</h3><p className="text-4xl font-bold text-blue-500 mt-2">{performanceSummary.quizzesTaken}</p></div><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center"><h3 className="text-lg font-semibold text-gray-500">Questões Respondidas</h3><p className="text-4xl font-bold text-blue-500 mt-2">{performanceSummary.totalQuestions}</p></div><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center"><h3 className="text-lg font-semibold text-gray-500">Respostas Corretas</h3><p className="text-4xl font-bold text-green-500 mt-2">{performanceSummary.correctAnswers}</p></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100"><h2 className="text-2xl font-bold text-gray-800 mb-4">Atividades Recentes</h2>{recentActivities.length > 0 ? ( <ul className="space-y-4">{recentActivities.map((activity) => ( <li key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-semibold text-gray-700">{activity.topic}</p><p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString('pt-BR')}</p></div><div className="text-right"><p className="font-bold text-lg text-blue-500">{Math.round((activity.score / activity.questions.length) * 100)}%</p><p className="text-sm text-gray-500">{activity.score}/{activity.questions.length} corretas</p></div></li> ))}</ul> ) : ( <div className="text-center py-8"><p className="text-gray-500">Nenhuma atividade recente. Que tal começar um novo quizz?</p><button onClick={() => onNavigate('quizSetup')} className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"><PlusCircleIcon /><span>Criar Quizz</span></button></div> )}</div><div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-center items-center text-center"><LightBulbIcon className="w-16 h-16 text-yellow-400 mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Recomendação do Dia</h2><p className="text-gray-600 mb-4">Com base no seu histórico, sugerimos revisar os tópicos com menor percentual de acerto.</p><button onClick={() => onNavigate('quizSetup')} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105">Iniciar Estudo Focado</button></div></div></div> );
};

const QuizSetupPage = ({ onStartQuiz, libraryItems }) => {
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState('');
  const [difficulty, setDifficulty] = useState('Médio');
  const [numQuestions, setNumQuestions] = useState(5);
  const [numDistractors, setNumDistractors] = useState(3);
  const [material, setMaterial] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic && !material) {
      setError('Por favor, defina um tópico ou selecione um material da sua biblioteca.');
      return;
    }
    setError('');
    const config = {
      topic: material ? `Baseado no material: ${libraryItems.find(item => item.id === material)?.name}` : topic,
      subtopics,
      difficulty,
      numQuestions,
      numDistractors,
      context: material ? libraryItems.find(item => item.id === material)?.content : null
    };
    onStartQuiz(config);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Crie seu Quizz Personalizado</h1>
        <p className="mt-2 text-lg text-gray-600">Defina os parâmetros e deixe a IA fazer o resto.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        
        <div>
          <label htmlFor="topic" className="block text-lg font-semibold text-gray-700">Tópico Principal</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!!material}
            placeholder="Ex: História do Brasil"
            className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-200"
          />
        </div>

        <div className="text-center text-gray-500 font-semibold">OU</div>

        <div>
            <label htmlFor="material" className="block text-lg font-semibold text-gray-700">Usar Material da Biblioteca</label>
            <select
                id="material"
                value={material}
                onChange={(e) => {
                    setMaterial(e.target.value);
                    if (e.target.value) setTopic('');
                }}
                className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <option value="">Selecione um material...</option>
                {libraryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                ))}
            </select>
        </div>

        <div>
          <label htmlFor="subtopics" className="block text-lg font-semibold text-gray-700">Subtópicos (opcional)</label>
          <input
            type="text"
            id="subtopics"
            value={subtopics}
            onChange={(e) => setSubtopics(e.target.value)}
            placeholder="Ex: Período Colonial, Independência"
            className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="difficulty" className="block text-lg font-semibold text-gray-700">Dificuldade</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Fácil</option>
              <option>Médio</option>
              <option>Difícil</option>
            </select>
          </div>
          <div>
            <label htmlFor="numQuestions" className="block text-lg font-semibold text-gray-700">Nº de Questões</label>
            <input
              type="number"
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
              min="1"
              max="20"
              className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="numDistractors" className="block text-lg font-semibold text-gray-700">Nº de Alternativas (incluindo a correta)</label>
          <input
            type="range"
            id="numDistractors"
            min="2"
            max="5"
            value={numDistractors + 1}
            onChange={(e) => setNumDistractors(parseInt(e.target.value, 10) - 1)}
            className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-gray-600 font-medium mt-1">{numDistractors + 1} alternativas</div>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 text-lg">
          <BrainIcon />
          <span>Gerar Quizz com IA</span>
        </button>
      </form>
    </div>
  );
};

const LibraryPage = ({ libraryItems, onAddItem, onRemoveItem }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemContent, setNewItemContent] = useState('');
    const [file, setFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');
    const [scriptsReady, setScriptsReady] = useState(false);

    useEffect(() => {
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Falha ao carregar o script: ${src}`));
                document.body.appendChild(script);
            });
        };

        Promise.all([
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.18/mammoth.browser.min.js")
        ]).then(() => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
            setScriptsReady(true);
        }).catch(error => {
            console.error(error);
            setError("Não foi possível carregar as ferramentas para leitura de arquivos. Por favor, recarregue a página.");
        });

    }, []);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setIsParsing(true);
        setError('');
        setFile(selectedFile);
        setNewItemName(selectedFile.name.replace(/\.[^/.]+$/, ""));

        const reader = new FileReader();

        try {
            if (selectedFile.type === 'text/plain') {
                reader.onload = (event) => {
                    setNewItemContent(event.target.result);
                    setIsParsing(false);
                };
                reader.readAsText(selectedFile);
            } else if (selectedFile.type === 'application/pdf') {
                if (typeof window.pdfjsLib === 'undefined') {
                    throw new Error('A biblioteca PDF.js não foi carregada.');
                }
                reader.onload = async (event) => {
                    const pdf = await window.pdfjsLib.getDocument(event.target.result).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ');
                    }
                    setNewItemContent(fullText);
                    setIsParsing(false);
                };
                reader.readAsArrayBuffer(selectedFile);
            } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                 if (typeof window.mammoth === 'undefined') {
                    throw new Error('A biblioteca Mammoth.js não foi carregada.');
                }
                reader.onload = async (event) => {
                    const result = await window.mammoth.extractRawText({ arrayBuffer: event.target.result });
                    setNewItemContent(result.value);
                    setIsParsing(false);
                };
                reader.readAsArrayBuffer(selectedFile);
            } else {
                throw new Error('Formato de arquivo não suportado. Use .txt, .pdf ou .docx');
            }
        } catch (err) {
            console.error("File parsing error:", err);
            setError(err.message);
            setFile(null);
            setNewItemName('');
            setNewItemContent('');
            setIsParsing(false);
        }
    };

    const handleAddItem = () => {
        if (!newItemName || !newItemContent) {
            setError('Nome e conteúdo do material são obrigatórios.');
            return;
        }
        onAddItem({
            name: newItemName,
            content: newItemContent,
        });
        setNewItemName('');
        setNewItemContent('');
        setFile(null);
        setError('');
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Sua Biblioteca de Estudos</h1>
                <p className="mt-2 text-lg text-gray-600">Adicione seus materiais para criar quizzes baseados neles.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Adicionar Novo Material</h2>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
                
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                             {scriptsReady ? (
                                <><UploadIcon className="w-10 h-10 mb-3 text-gray-400" /><p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p><p className="text-xs text-gray-500">Arquivos .PDF, .DOCX, .TXT</p></>
                            ) : (
                                <Loader text="Carregando leitor..." />
                            )}
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" disabled={!scriptsReady || isParsing} />
                    </label>
                </div> 
                
                {isParsing && <Loader text="Processando arquivo..." />}
                
                {file && !isParsing && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-semibold text-blue-800">Arquivo selecionado: {file.name}</p>
                        <p className="text-sm text-blue-700">Conteúdo extraído com sucesso!</p>
                    </div>
                )}

                <div>
                    <label htmlFor="itemName" className="block text-lg font-semibold text-gray-700">Nome do Material</label>
                    <input
                        type="text"
                        id="itemName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Ex: Resumo de Biologia Celular"
                        className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <button
                    onClick={handleAddItem}
                    disabled={isParsing || !newItemContent || !scriptsReady}
                    className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <PlusCircleIcon />
                    <span>Adicionar à Biblioteca</span>
                </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Seus Materiais</h2>
                {libraryItems.length > 0 ? (
                    <ul className="space-y-3">
                        {libraryItems.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <BookOpenIcon className="w-6 h-6 text-blue-500" />
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 font-semibold">
                                    Remover
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-6">Sua biblioteca está vazia.</p>
                )}
            </div>
        </div>
    );
};

const StudyPage = ({ quiz, onFinishQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const handleNext = () => {
    const newAnswer = { question: currentQuestion.question, selectedAnswer, correctAnswer: currentQuestion.correctAnswer, isCorrect: selectedAnswer === currentQuestion.correctAnswer, explanation: currentQuestion.explanation };
    setAnswers([...answers, newAnswer]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onFinishQuiz([...answers, newAnswer], quiz.topic);
    }
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-blue-600 mb-4">{quiz.topic}</h2>
        <div className="mb-6">
          <div className="flex justify-between mb-1"><span className="text-base font-medium text-blue-700">Progresso</span><span className="text-sm font-medium text-blue-700">{currentQuestionIndex + 1} de {quiz.questions.length}</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div></div>
        </div>
        <div className="mb-6"><p className="text-2xl font-semibold text-gray-800">{currentQuestion.question}</p></div>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-lg font-medium ";
            if (showFeedback) {
              if (option === currentQuestion.correctAnswer) buttonClass += "bg-green-100 border-green-500 text-green-800";
              else if (selectedAnswer === option) buttonClass += "bg-red-100 border-red-500 text-red-800";
              else buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
            } else {
              if (selectedAnswer === option) buttonClass += "bg-blue-100 border-blue-500 ring-2 ring-blue-300";
              else buttonClass += "bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400";
            }
            return (<button key={index} onClick={() => handleAnswer(option)} disabled={showFeedback} className={buttonClass}>{option}</button>);
          })}
        </div>
        <div className="mt-8">
          {showFeedback && (
            <div className="p-4 rounded-lg mb-4 text-left animate-fade-in bg-blue-50 border border-blue-200">
              <h4 className="font-bold text-lg text-blue-800 mb-2">Comentário do Tutor IA</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{currentQuestion.explanation}</p>
            </div>
          )}
          {showFeedback && <button onClick={handleNext} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600">{currentQuestionIndex < quiz.questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quizz'}</button>}
        </div>
      </div>
    </div>
  );
};

const ResultsPage = ({ results, topic, onAnalyze, analysis, onReset, isLoadingAnalysis }) => {
  const score = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Resultados do Quizz</h1>
        <p className="text-xl text-gray-600 mt-2">{topic}</p>
        <div className="my-8">
          <div className={`relative w-48 h-48 mx-auto flex items-center justify-center rounded-full ${percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}><p className={`text-5xl font-bold ${percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p></div>
          <p className="text-2xl font-semibold text-gray-700 mt-4">{score} de {total} respostas corretas</p>
        </div>
        <div className="text-left space-y-4 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Resumo das Respostas</h3>
          {results.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-semibold text-gray-800">{index + 1}. {result.question}</p>
              <p className={`mt-2 ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>Sua resposta: {result.selectedAnswer} {result.isCorrect ? <CheckCircleIcon className="inline w-5 h-5 ml-1" /> : <XCircleIcon className="inline w-5 h-5 ml-1" />}</p>
              {!result.isCorrect && <p className="text-gray-600 mt-1">Resposta correta: <strong>{result.correctAnswer}</strong></p>}
               <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{result.explanation}</p>
               </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Análise com IA</h3>
          {isLoadingAnalysis ? <Loader text="Analisando seu desempenho..." /> : analysis ? <div className="text-left space-y-2 text-gray-700 whitespace-pre-wrap">{analysis}</div> : (<><p className="text-gray-600 mb-4">Receba feedback personalizado da nossa IA.</p><button onClick={onAnalyze} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600">Analisar meu Desempenho</button></>)}
        </div>
        <button onClick={onReset} className="mt-8 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800">Voltar ao Dashboard</button>
      </div>
    </div>
  );
};

const SettingsPage = ({ user, prompts, onSavePrompts }) => {
    const [quizPrompt, setQuizPrompt] = useState(prompts.quiz);
    const [tutorPrompt, setTutorPrompt] = useState(prompts.tutor);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSavePrompts({ quiz: quizPrompt, tutor: tutorPrompt });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Configurações da IA</h1>
                <p className="mt-2 text-lg text-gray-600">Personalize o comportamento do seu tutor de IA.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                <div>
                    <label htmlFor="quizPrompt" className="block text-lg font-semibold text-gray-700">Prompt do Gerador de Quizz</label>
                    <p className="text-sm text-gray-500 mb-2">Este é o prompt que a IA usa para criar as perguntas. Você pode ajustar o tom, estilo e complexidade.</p>
                    <textarea id="quizPrompt" value={quizPrompt} onChange={e => setQuizPrompt(e.target.value)} rows="10" className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-400"></textarea>
                </div>
                <div>
                    <label htmlFor="tutorPrompt" className="block text-lg font-semibold text-gray-700">Prompt do Tutor de Análise</label>
                    <p className="text-sm text-gray-500 mb-2">Este prompt guia a IA ao fornecer feedback sobre seus resultados. Altere para focar em pontos específicos.</p>
                    <textarea id="tutorPrompt" value={tutorPrompt} onChange={e => setTutorPrompt(e.target.value)} rows="10" className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-400"></textarea>
                </div>
                <button onClick={handleSave} disabled={saving} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                    {saving ? 'Salvando...' : (saved ? 'Salvo com Sucesso!' : 'Salvar Prompts')}
                </button>
            </div>
        </div>
    );
};

const ChatPage = ({ user, libraryItems, quizHistory, chatHistory, onSendMessage, onClearHistory }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const chatEndRef = React.useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        setIsLoading(true);
        await onSendMessage(input);
        setInput('');
        setIsLoading(false);
    };

    const handleConfirmClear = () => {
        onClearHistory();
        setShowClearConfirm(false);
    }

    return (
        <>
            {showClearConfirm && (
                <Modal title="Confirmar Exclusão" onClose={() => setShowClearConfirm(false)}>
                    <p>Tem certeza de que deseja apagar todo o histórico do chat? Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleConfirmClear} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Apagar</button>
                    </div>
                </Modal>
            )}
            <div className="animate-fade-in max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
                <div className="text-center mb-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Chat com a Mentora</h1>
                    <p className="mt-2 text-lg text-gray-600">Tire suas dúvidas sobre seus estudos ou qualquer outro tópico.</p>
                </div>
                <div className="flex-grow bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col overflow-y-auto">
                    <div className="flex-grow space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800">
                                    <span className="animate-pulse">Digitando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pergunte algo à sua mentora..."
                            className="flex-grow px-4 py-3 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400" disabled={isLoading}>
                            <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                        <button type="button" onClick={() => setShowClearConfirm(true)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 disabled:bg-gray-400" title="Limpar histórico">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};


// --- Componente Principal (App) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  
  const [quizConfig, setQuizConfig] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  
  const [quizHistory, setQuizHistory] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [prompts, setPrompts] = useState({ quiz: '', tutor: '' });
  const [chatHistory, setChatHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  
  const defaultPrompts = {
    quiz: `Gere um quizz em português do Brasil com as seguintes especificações:\n- Tópico: {topic}\n- Dificuldade: {difficulty}\n- Número de questões: {numQuestions}\n- Número de alternativas por questão: {numOptions}\n{context}\nSua resposta DEVE ser um objeto JSON válido, sem nenhum texto ou formatação adicional. A estrutura deve ser:\n{\n  "questions": [\n    {\n      "question": "Texto da pergunta",\n      "options": ["Alternativa 1", "Alternativa 2", "Alternativa 3", "Alternativa 4"],\n      "correctAnswer": "A alternativa correta",\n      "explanation": "Uma explicação didática e detalhada sobre a resposta correta, e por que as outras estão incorretas."\n    }\n  ]\n}\nCertifique-se de que "correctAnswer" seja idêntico a um dos valores em "options".`,
    tutor: `Como um tutor de IA, analise o desempenho do aluno neste quizz.\nTópico: {topic}\nResultados:\n{results}\nForneça um feedback construtivo e personalizado. Destaque os pontos fortes e as áreas que precisam de melhoria. Sugira um plano de estudos simples e prático. Formate a resposta de forma clara e motivadora, usando títulos como "Feedback do Tutor IA" e "Seu Plano de Estudos".`
  };

  // Efeito para monitorar o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
      } else {
        setUser(null);
        setQuizHistory([]);
        setLibraryItems([]);
        setChatHistory([]);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (currentUser) => {
      setIsLoading(true);
      const uid = currentUser.uid;
      try {
          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
              await setDoc(userDocRef, { createdAt: new Date().toISOString(), email: currentUser.email });
              const promptsDocRef = doc(db, "users", uid, "settings", "prompts");
              await setDoc(promptsDocRef, defaultPrompts);
              setPrompts(defaultPrompts);
              setQuizHistory([]);
              setLibraryItems([]);
              setChatHistory([{ role: 'assistant', content: 'Olá! Eu sou sua mentora de IA. Como posso ajudar nos seus estudos hoje?' }]);
          } else {
              const historyQuery = query(collection(db, "users", uid, "quizHistory"));
              const historySnapshot = await getDocs(historyQuery);
              setQuizHistory(historySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

              const libraryQuery = query(collection(db, "users", uid, "library"));
              const librarySnapshot = await getDocs(libraryQuery);
              setLibraryItems(librarySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
              
              const promptsDocRef = doc(db, "users", uid, "settings", "prompts");
              const promptsDoc = await getDoc(promptsDocRef);
              setPrompts(promptsDoc.exists() ? promptsDoc.data() : defaultPrompts);

              const chatQuery = query(collection(db, "users", uid, "chatHistory"), orderBy("timestamp", "asc"));
              const chatSnapshot = await getDocs(chatQuery);
              const chatData = chatSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              if (chatData.length === 0) {
                  setChatHistory([{ role: 'assistant', content: 'Olá! Eu sou sua mentora de IA. Como posso ajudar nos seus estudos hoje?' }]);
              } else {
                  setChatHistory(chatData);
              }
          }
      } catch (err) {
          console.error("Erro ao carregar dados do usuário:", err);
          setError("Não foi possível carregar seus dados. Verifique suas regras de segurança do Firestore ou a conexão.");
          setCurrentPage('error');
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleSavePrompts = async (newPrompts) => {
      if (!user) return;
      const promptsDocRef = doc(db, "users", user.uid, "settings", "prompts");
      await setDoc(promptsDocRef, newPrompts);
      setPrompts(newPrompts);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setQuizResults(null);
    setCurrentQuiz(null);
    setAiAnalysis('');
  };

  const handleStartQuiz = (config) => {
    setQuizConfig(config);
    setCurrentPage('loading');
    setIsLoading(true);
    generateQuiz(config);
  };
  
  const handleFinishQuiz = async (answers, topic) => {
    const score = answers.filter(a => a.isCorrect).length;
    const newHistoryItem = {
      date: new Date().toISOString(),
      topic,
      score,
      questions: currentQuiz.questions,
      answers,
    };
    if(user) {
        const docRef = await addDoc(collection(db, "users", user.uid, "quizHistory"), newHistoryItem);
        setQuizHistory([...quizHistory, {id: docRef.id, ...newHistoryItem}]);
    }
    setQuizResults(answers);
    setCurrentPage('results');
  };
  
  const handleAddLibraryItem = async (item) => {
    if(!user) return;
    const docRef = await addDoc(collection(db, "users", user.uid, "library"), item);
    setLibraryItems([...libraryItems, {id: docRef.id, ...item}]);
  };

  const handleRemoveLibraryItem = async (id) => {
    if(!user) return;
    await deleteDoc(doc(db, "users", user.uid, "library", id));
    setLibraryItems(libraryItems.filter(item => item.id !== id));
  };
  
  const handleSendMessageToAI = async (input) => {
      const userMessage = { 
          role: 'user', 
          content: input, 
          timestamp: Timestamp.now() 
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      await addDoc(collection(db, "users", user.uid, "chatHistory"), userMessage);

      const context = `Contexto do Usuário: - Nome: ${user.displayName || user.email} - Materiais na Biblioteca: ${libraryItems.map(item => item.name).join(', ') || 'Nenhum'} - Histórico de Quizzes: ${quizHistory.length} quizzes realizados.`;
      const prompt = `${context}\n\nO usuário pergunta: ${input}\n\nResponda como uma mentora de IA amigável e prestativa. Se a pergunta for sobre um tópico geral, use suas habilidades de busca para encontrar a informação mais atual.`;

      try {
          const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
          const payload = {
              contents: [{ parts: [{ text: prompt }] }],
              tool_config: {
                  tools: [{ "google_search_retrieval": {} }]
              }
          };

          const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!response.ok) {
              const errorText = await response.text();
              console.error("API Error Body:", errorText);
              throw new Error(`API Error: ${response.status} ${response.statusText}. Verifique se a API 'Vertex AI API' está ativada no seu projeto Google Cloud.`);
          }
          const result = await response.json();
          if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
              throw new Error("A resposta da API está malformada.");
          }
          const assistantMessageContent = result.candidates[0].content.parts[0].text;
          const assistantMessage = { role: 'assistant', content: assistantMessageContent, timestamp: Timestamp.now() };
          
          await addDoc(collection(db, "users", user.uid, "chatHistory"), assistantMessage);
          setChatHistory(prev => [...prev, assistantMessage]);

      } catch (err) {
          console.error("Erro no chat:", err);
          const errorMessage = { role: 'assistant', content: `Desculpe, ocorreu um erro: ${err.message}`, timestamp: Timestamp.now() };
          await addDoc(collection(db, "users", user.uid, "chatHistory"), errorMessage);
          setChatHistory(prev => [...prev, errorMessage]);
      }
  };

  const handleClearChatHistory = async () => {
      if (!user) return;
      const chatQuery = query(collection(db, "users", user.uid, "chatHistory"));
      const chatSnapshot = await getDocs(chatQuery);
      for (const doc of chatSnapshot.docs) {
          await deleteDoc(doc.ref);
      }
      setChatHistory([{ role: 'assistant', content: 'Histórico limpo! Como posso ajudar?' }]);
  };

  const generateQuiz = async (config) => {
    let finalPrompt = prompts.quiz
        .replace('{topic}', config.topic)
        .replace('{difficulty}', config.difficulty)
        .replace('{numQuestions}', config.numQuestions)
        .replace('{numOptions}', (config.numDistractors || 3) + 1)
        .replace('{context}', config.context ? `- Use o seguinte texto como base: "${config.context}"` : '');

    try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: finalPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        
        const result = await response.json();
        if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("A resposta da API está malformada.");
        }

        const jsonText = result.candidates[0].content.parts[0].text;
        const quizData = JSON.parse(jsonText);
        setCurrentQuiz({ ...quizData, topic: config.topic });
        setCurrentPage('study');
    } catch (err) {
        console.error("Erro ao gerar quizz:", err);
        setError("Ocorreu um erro ao gerar o quizz.");
        setCurrentPage('error');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAnalyzeResults = async () => {
    setIsLoadingAnalysis(true);
    setAiAnalysis('');
    
    const resultsText = quizResults.map((r, i) => `Questão ${i+1}: ${r.question}\nSua Resposta: ${r.selectedAnswer} (${r.isCorrect ? 'Correta' : 'Incorreta'})`).join('\n\n');
    let finalPrompt = prompts.tutor
        .replace('{topic}', quizHistory[quizHistory.length-1].topic)
        .replace('{results}', resultsText);
    
    try {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: finalPrompt }] }] };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        
        const result = await response.json();
        if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("A resposta da API está malformada.");
        }
        setAiAnalysis(result.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error("Erro ao analisar resultados:", err);
        setAiAnalysis("Desculpe, não foi possível gerar a análise.");
    } finally {
        setIsLoadingAnalysis(false);
    }
  };

  if (loadingUser) {
    return <Loader text="Carregando PsiQuizz AI..." />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} quizHistory={quizHistory} />;
      case 'chat': return <ChatPage user={user} libraryItems={libraryItems} quizHistory={quizHistory} chatHistory={chatHistory} onSendMessage={handleSendMessageToAI} onClearHistory={handleClearChatHistory} />;
      case 'quizSetup': return <QuizSetupPage onStartQuiz={handleStartQuiz} libraryItems={libraryItems} />;
      case 'library': return <LibraryPage libraryItems={libraryItems} onAddItem={handleAddLibraryItem} onRemoveItem={handleRemoveLibraryItem} />;
      case 'study': return <StudyPage quiz={currentQuiz} onFinishQuiz={handleFinishQuiz} />;
      case 'results': return <ResultsPage results={quizResults} topic={quizHistory.length > 0 ? quizHistory[quizHistory.length-1].topic : ''} onAnalyze={handleAnalyzeResults} analysis={aiAnalysis} onReset={() => handleNavigate('home')} isLoadingAnalysis={isLoadingAnalysis} />;
      case 'settings': return <SettingsPage user={user} prompts={prompts} onSavePrompts={handleSavePrompts} />;
      case 'loading': return <Loader text="Gerando seu quizz com a IA..." />;
      case 'error': return ( <Modal title="Erro" onClose={() => handleNavigate('quizSetup')}><p>{error}</p><button onClick={() => handleNavigate('quizSetup')}>Tentar Novamente</button></Modal> );
      default: return <HomePage onNavigate={handleNavigate} quizHistory={quizHistory} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#F0F8FF', fontFamily: "'PT Sans', sans-serif" }}>
      <Header onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading ? <Loader text="Carregando dados..." /> : renderPage()}
      </main>
      <footer className="text-center py-4 mt-8"><p className="text-gray-500">Criado com ❤️ por PsiQuizz AI</p></footer>
    </div>
  );
}
