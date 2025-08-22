import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
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
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
            {/* A rota /study-mode não é mais necessária como uma página separada */}
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