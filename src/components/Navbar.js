import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold">Psiquizz AI</Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                Dashboard
              </Link>
              <Link to="/library" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                Biblioteca
              </Link>
              <Link to="/quiz-generator" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                Novo Quizz
              </Link>
              <Link to="/chat" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                Chat com Izy
              </Link>
              <Link to="/settings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                Configurações
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;