import 'dotenv/config'; // Load environment variables from .env file

import express from 'express';
import cors from 'cors';
import axios from 'axios'; // Keep axios for AI calls
import pkg from 'lz-string'; // Keep lz-string if used elsewhere
const { compress, decompress } = pkg;
import chatRouter from './chat.js';
import quizRouter from './quiz.js';
import jwt from 'jsonwebtoken'; // For Supabase JWT verification
import crypto from 'crypto'; // For hashPrompt, if still used
// import { createClient } from '@supabase/supabase-js'; // REMOVE THIS IMPORT

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(chatRouter);
app.use(quizRouter);

// REMOVE Supabase Admin client initialization
// const supabaseAdmin = createClient(
//   process.env.SUPABASE_URL, // Use SUPABASE_URL from backend .env
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// --- Supabase JWT Authentication Middleware ---
export async function authMiddleware(req, res, next) {
  // Placeholder for Appwrite authentication.
  // For now, allow all requests to pass through.
  // In a real Appwrite setup, you would verify session cookies or Appwrite JWTs here.
  console.warn('AuthMiddleware is currently a placeholder. All requests are allowed.');
  req.user = { uid: 'placeholder_user_id' }; // Provide a dummy user ID for now
  next();
}

// --- Utility Functions (Keep if still used) ---
// Função utilitária: compacta e resume tentativas (if still used by insights)
function summarizeAttempts(attempts, max = 5) {
  return attempts.slice(-max).map(a => ({
    topic: a.topic,
    score: a.score,
    totalQuestions: a.totalQuestions,
    attemptedAt: a.attemptedAt,
    timeSpent: a.timeSpent,
    difficulty: a.difficulty
  }));
}

// Função utilitária: gera hash do prompt para cache (if still used by insights)
function hashPrompt(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// --- Routes (Modified to remove Firestore/Firebase Admin SDK dependencies) ---

// Rota principal para insights de estudo (Firestore caching removed)
app.post('/api/insights', authMiddleware, async (req, res) => {
  const { attempts, stats } = req.body;
  if (!attempts || !stats) return res.status(400).json({ error: 'Dados insuficientes' });

  const summarized = summarizeAttempts(attempts);
  const prompt = `Você é um coach de estudos. Analise os resultados abaixo e gere insights personalizados para o usuário.\n\n` +
    `Média Geral de Acertos: ${stats.averageScore}%
` +
    `Quizzes Realizados: ${stats.quizzesTaken}
` +
    `Desempenho por Tópico: ${JSON.stringify(summarized.map(a => ({ topic: a.topic, score: Math.round((a.score / a.totalQuestions) * 100) })))
}
`;

  // Note: Firestore caching for insights has been removed as per user request.
  // If caching is desired, it needs to be re-implemented using a different mechanism (e.g., Redis, file system, or Supabase database).

  let aiResponse = 'Mock: Insight gerado.';
  try {
    // Example of real Gemini call (assuming GEMINI_API_KEY is set)
    // const geminiRes = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', { contents: [{ parts: [{ text: prompt }] }] }, { params: { key: process.env.GEMINI_API_KEY } });
    // aiResponse = geminiRes.data.candidates[0]?.content?.parts[0]?.text || aiResponse;
  } catch (err) {
    console.error('Erro ao chamar IA para insights:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Erro ao chamar IA para insights' });
  }

  res.json({ insight: aiResponse, source: 'gemini' });
});

// Rota para controle de uso (tokens) - Removed as it relied on Firestore
// app.get('/api/usage', authMiddleware, async (req, res) => {
//   const usageRef = db.collection('usageLogs').doc(req.user.uid);
//   const usage = await usageRef.get();
//   res.json(usage.exists ? usage.data() : { tokens: 0 });
// });

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend Psiquizz rodando!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
