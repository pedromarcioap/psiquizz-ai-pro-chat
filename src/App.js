import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import AuthPage from './pages/AuthPage';
import LibraryPage from './pages/LibraryPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import StudyModePage from './pages/StudyModePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApiConfigModal from './components/ApiConfigModal';

function App() {
  const [user, setUser] = useState(null);
  console.log('User state in App.js:', user);
  const [loading, setLoading] = useState(true);
  // Orquestração de IA
  const getStoredConfig = () => {
    try {
      const stored = localStorage.getItem('aiConfig');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to parse stored AI config:", e);
      return {};
    }
  };

  const initialConfig = getStoredConfig();

  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [selectedApiProvider, setSelectedApiProvider] = useState(initialConfig.selectedApiProvider || 'gemini');
  const [openRouterConfig, setOpenRouterConfig] = useState(initialConfig.openRouterConfig || { apiKey: '', model: '' });
  const [huggingFaceConfig, setHuggingFaceConfig] = useState(initialConfig.huggingFaceConfig || { apiKey: '', model: '' });
  const [useWebSearch, setUseWebSearch] = useState(initialConfig.useWebSearch || false);

  useEffect(() => {
    const { data: { subscription: unsubscribe } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      unsubscribe.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const configToStore = {
      selectedApiProvider,
      openRouterConfig,
      huggingFaceConfig,
      useWebSearch,
    };
    localStorage.setItem('aiConfig', JSON.stringify(configToStore));
  }, [selectedApiProvider, openRouterConfig, huggingFaceConfig, useWebSearch]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar />}
        <main className="flex-grow">
          {/* Configuração de IA e toggle web search */}
          <div className="flex items-center justify-end gap-4 p-2">
            <button
              onClick={() => setShowApiConfigModal(true)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
            >
              Configurar APIs de IA
            </button>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useWebSearch} onChange={e => setUseWebSearch(e.target.checked)} />
              Pesquisar na Web
            </label>
          </div>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            {user ? (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route
                  path="/chat"
                  element={
                    <ChatPage
                      selectedApiProvider={selectedApiProvider}
                      openRouterConfig={openRouterConfig}
                      huggingFaceConfig={huggingFaceConfig}
                      useWebSearch={useWebSearch}
                    />
                  }
                />
                <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/auth" />} />
            )}
          </Routes>
        </main>
        <Footer />
      <ApiConfigModal
          show={showApiConfigModal}
          onClose={() => setShowApiConfigModal(false)}
          selectedApiProvider={selectedApiProvider}
          setSelectedApiProvider={setSelectedApiProvider}
          openRouterConfig={openRouterConfig}
          setOpenRouterConfig={setOpenRouterConfig}
          huggingFaceConfig={huggingFaceConfig}
          setHuggingFaceConfig={setHuggingFaceConfig}
        />
      </div>
    </Router>
  );
}

export default App;