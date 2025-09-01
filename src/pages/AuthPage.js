import React, { useState } from 'react';
import { account } from '../services/appwriteClient';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await account.createEmailSession(email, password);
      } else {
        // Appwrite's create account requires a unique ID, email, and password
        // We can generate a unique ID or let Appwrite generate one if not provided
        await account.create('unique()', email, password);
        await account.createEmailSession(email, password); // Log in after creating account
      }
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      console.error("Auth error:", err); // Log full error for debugging
      // Appwrite errors have a 'message' property
      setError(err.message || 'Ocorreu um erro desconhecido.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Appwrite's createOAuth2Session redirects to Google for authentication
      // and then back to your app. 
      // The URL should be where your Appwrite project is hosted, and then /auth/callback
      // For local development, it might be http://localhost:3000/auth/callback
      // You need to configure the redirect URL in your Appwrite console.
      await account.createOAuth2Session('google', 'http://localhost:3000/dashboard', 'http://localhost:3000/auth');
      // Appwrite handles the redirect, so no navigate('/dashboard') here
    } catch (err) {
      console.error("Auth error (Google):", err); // Log full error for debugging
      setError(err.message || 'Ocorreu um erro desconhecido ao entrar com o Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entrar na sua conta' : 'Criar uma nova conta'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Endereço de e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                  fill="#4285F4"
                />
              </svg>
              Entrar com Google
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;