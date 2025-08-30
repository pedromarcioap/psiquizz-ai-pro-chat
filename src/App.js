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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Orquestração de IA
  const [aiMode, setAiMode] = useState('flash'); // 'offline' | 'flash' | 'pro'
  const [useWebSearch, setUseWebSearch] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar />}
        <main className="flex-grow">
          {/* Header de modo IA e toggle web search */}
          <div className="flex items-center justify-end gap-4 p-2">
            <select value={aiMode} onChange={e => setAiMode(e.target.value)} className="border rounded px-2 py-1">
              <option value="offline">Offline</option>
              <option value="flash">Gemini Flash</option>
              <option value="pro">Gemini Pro</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useWebSearch} onChange={e => setUseWebSearch(e.target.checked)} />
              Pesquisar na Web
            </label>
          </div>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat" element={<ChatPage aiMode={aiMode} useWebSearch={useWebSearch} />} />
            <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;