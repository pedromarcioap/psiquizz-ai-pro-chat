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
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/auth" />} />
            <Route path="/library" element={user ? <LibraryPage /> : <Navigate to="/auth" />} />
            <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/auth" />} />
            <Route path="/quiz-generator" element={user ? <QuizGeneratorPage /> : <Navigate to="/auth" />} />
            <Route path="/study-mode" element={user ? <StudyModePage /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;