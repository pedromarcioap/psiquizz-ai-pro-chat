import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../utils/hooks';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar histórico de mensagens
  useEffect(() => {
    if (!user) return;
    const loadChatHistory = async () => {
      try {
        const q = query(collection(db, 'users', user.uid, 'chatHistory'), orderBy('timestamp'));
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setMessages(messagesData);
      } catch (err) {
        console.error('Erro ao carregar histórico de chat:', err);
      }
    };

    loadChatHistory();
  }, [user]);

  // Função para enviar mensagem para a IA
  const handleSendMessageToAI = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      setLoading(true);
      setError('');

      // Adicionar mensagem do usuário ao histórico (otimista)
      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Salvar mensagem do usuário no Firestore
      if (!user) throw new Error("Usuário não autenticado");
      await addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
        role: 'user',
        content: messageText,
        timestamp: Timestamp.fromDate(new Date())
      });

      // Construir contexto para a IA
      const context = `Você é Izy, uma mentora de estudos inteligente e amigável.
      Ajude o usuário com suas dúvidas sobre os materiais de estudo.
      Seja didática e forneça explicações claras.`;

      // Montar o prompt final
      const finalPrompt = `${context}\n\nPergunta do usuário: ${messageText}`;

      // Chamar a API Gemini
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Usar modelo mais recente
      
      // Adicionar tratamento de erro mais detalhado
      try {
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const aiText = response.text();
        
        // Verificar se a resposta é válida
        if (!aiText || aiText.trim() === '') {
          throw new Error('Resposta vazia da API Gemini');
        }
      } catch (apiError) {
        console.error('Erro específico da API Gemini:', apiError);
        throw new Error(`Falha na comunicação com a API Gemini: ${apiError.message}`);
      }

      // Adicionar resposta da IA ao histórico
      const aiMessage = {
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Salvar resposta da IA no Firestore
      if (!user) throw new Error("Usuário não autenticado");
      await addDoc(collection(db, 'users', user.uid, 'chatHistory'), {
        role: 'assistant',
        content: aiText,
        timestamp: Timestamp.fromDate(new Date())
      });

      setLoading(false);
    } catch (err) {
      setError('Erro ao enviar mensagem: ' + err.message);
      setLoading(false);
    }
  };

  // Função para lidar com o envio de mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    await handleSendMessageToAI(input);
    setInput('');
  };

  // Função para limpar o histórico de chat
  const handleClearChatHistory = async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'chatHistory'));
      const batchPromises = querySnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(batchPromises);
      
      setMessages([]);
    } catch (err) {
      setError('Erro ao limpar histórico: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat com Izy</h1>
        <button
          onClick={handleClearChatHistory}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Limpar Histórico
        </button>
      </div>
      
      <div className="flex-1 bg-white shadow rounded-lg p-4 mb-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Inicie uma conversa com Izy, sua mentora de estudos!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-indigo-100 text-indigo-900 rounded-br-none' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs mt-1 text-gray-500">
                    {message.timestamp?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-l-md p-2 border"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default ChatPage;