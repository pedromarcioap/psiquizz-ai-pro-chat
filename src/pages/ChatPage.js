import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../utils/hooks';
import ReactMarkdown from 'react-markdown';
import ChatHistorySidebar from '../components/ChatHistorySidebar';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [libraryMaterials, setLibraryMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatName, setChatName] = useState('Novo Chat');
  const messagesEndRef = useRef(null);

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar histórico de mensagens
  // Carregar a lista de chats
  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      const q = query(collection(db, 'users', user.uid, 'chats'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatsData);
      if (chatsData.length > 0 && !activeChatId) {
        setActiveChatId(chatsData.id);
        setChatName(chatsData.name);
      }
    };
    loadChats();
  }, [user]);

  // Carregar mensagens do chat ativo
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      const q = query(collection(db, 'users', user.uid, 'chats', activeChatId, 'messages'), orderBy('timestamp'));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp?.toDate() }));
      setMessages(messagesData);
    };
    loadMessages();
  }, [activeChatId, user]);

  // Carregar materiais da biblioteca
  useEffect(() => {
    if (!user) return;
    const loadLibraryMaterials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'library'));
        const materialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLibraryMaterials(materialsData);
      } catch (err) {
        console.error('Erro ao carregar materiais da biblioteca:', err);
      }
    };

    loadLibraryMaterials();
  }, [user]);

  const handleNewChat = async () => {
    const newChatName = `Chat ${new Date().toLocaleString('pt-BR')}`;
    const newChat = {
      name: newChatName,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'chats'), newChat);
    setActiveChatId(docRef.id);
    setChatName(newChatName);
    setMessages([]);
    setChats(prev => [{ id: docRef.id, ...newChat }, ...prev]);
  };

  const handleSelectChat = (chatId) => {
    const selected = chats.find(c => c.id === chatId);
    setActiveChatId(chatId);
    setChatName(selected.name);
  };

  const handleSendMessageToAI = async (messageText) => {
    if (!messageText.trim()) return;
    let currentChatId = activeChatId;

    try {
      setLoading(true);
      setError('');

      if (!currentChatId) {
        const newChatName = `Chat ${new Date().toLocaleString('pt-BR')}`;
        const newChat = { name: newChatName, createdAt: Timestamp.now() };
        const docRef = await addDoc(collection(db, 'users', user.uid, 'chats'), newChat);
        currentChatId = docRef.id;
        setActiveChatId(currentChatId);
        setChatName(newChatName);
        setChats(prev => [{ id: docRef.id, ...newChat }, ...prev]);
      }

      const userMessage = { role: 'user', content: messageText, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);

      await addDoc(collection(db, 'users', user.uid, 'chats', currentChatId, 'messages'), {
        ...userMessage,
        timestamp: Timestamp.fromDate(userMessage.timestamp),
      });

      const context = `Você é Izy, uma mentora de estudos inteligente e amigável...`;
      const materialContext = selectedMaterial ? `\n\nContexto: ${selectedMaterial.content}` : '';
      const finalPrompt = `${context}${materialContext}\n\nPergunta: ${messageText}`;

      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const aiText = response.text();

      const aiMessage = { role: 'assistant', content: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);

      await addDoc(collection(db, 'users', user.uid, 'chats', currentChatId, 'messages'), {
        ...aiMessage,
        timestamp: Timestamp.fromDate(aiMessage.timestamp),
      });

      setLoading(false);
    } catch (err) {
      setError('Erro ao enviar mensagem: ' + err.message);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await handleSendMessageToAI(input);
    setInput('');
  };

  const handleRenameChat = async (chatId, newName) => {
    const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
    await updateDoc(chatRef, { name: newName });
    setChats(chats.map(c => c.id === chatId ? { ...c, name: newName } : c));
    if (activeChatId === chatId) {
      setChatName(newName);
    }
  };

  const handleDeleteChat = async (chatId) => {
    // Adicionar a lógica para excluir subcoleção de mensagens aqui, se necessário
    await deleteDoc(doc(db, 'users', user.uid, 'chats', chatId));
    setChats(chats.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setChatName('Novo Chat');
      setMessages([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <ChatHistorySidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{chatName}</h1>
        </div>

        <div className="mb-4">
          <label htmlFor="material-select" className="block text-sm font-medium text-gray-700 mb-1">
            Selecione um material da biblioteca para discutir:
          </label>
          <select
            id="material-select"
            value={selectedMaterial ? selectedMaterial.id : ''}
            onChange={(e) => {
              const materialId = e.target.value;
              const material = libraryMaterials.find(m => m.id === materialId);
              setSelectedMaterial(material);
            }}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
          >
            <option value="">Nenhum</option>
            {libraryMaterials.map(material => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 bg-white shadow rounded-lg p-4 mb-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Inicie uma conversa com Izy!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-900'}`}>
                    <div className="text-sm prose"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                    <div className="text-xs mt-1 text-gray-500">
                      {message.timestamp?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Enviar
          </button>
        </form>
        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default ChatPage;