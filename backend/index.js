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

const app = express();
app.use(cors());
app.use(express.json());
app.use(chatRouter);
app.use(quizRouter);

// --- Supabase JWT Authentication Middleware ---
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  console.log('--- authMiddleware Debug ---');
  console.log('Token recebido no backend:', token);

  if (!token) {
    console.log('Erro: Token ausente.');
    return res.status(401).json({ error: 'Token ausente' });
  }

  if (!process.env.SUPABASE_JWT_SECRET) {
    console.error('Erro: SUPABASE_JWT_SECRET não configurado nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    console.log('Token decodificado com sucesso:', decoded);
    req.user = { uid: decoded.sub }; // Supabase user ID is in 'sub' claim
    next();
  } catch (err) {
    console.error('Erro ao verificar token JWT no backend:', err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
  console.log('--- Fim authMiddleware Debug ---');
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