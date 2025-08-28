import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import axios from 'axios';
import pkg from 'lz-string';
const { compress, decompress } = pkg;
import chatRouter from './chat.js';
import quizRouter from './quiz.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(chatRouter);
app.use(quizRouter);

// Inicialização do Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (e) {
  // Evita erro de múltipla inicialização
}
const db = admin.firestore();

// Middleware de autenticação Firebase
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Função utilitária: compacta e resume tentativas
function summarizeAttempts(attempts, max = 5) {
  // Mantém só as últimas tentativas e remove campos irrelevantes
  return attempts.slice(-max).map(a => ({
    topic: a.topic,
    score: a.score,
    totalQuestions: a.totalQuestions,
    attemptedAt: a.attemptedAt,
    timeSpent: a.timeSpent,
    difficulty: a.difficulty
  }));
}

// Função utilitária: gera hash do prompt para cache
import crypto from 'crypto';
function hashPrompt(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Rota principal para insights de estudo
app.post('/api/insights', authMiddleware, async (req, res) => {
  const { attempts, stats } = req.body;
  if (!attempts || !stats) return res.status(400).json({ error: 'Dados insuficientes' });

  // Compacta e resume tentativas
  const summarized = summarizeAttempts(attempts);
  const prompt = `Você é um coach de estudos. Analise os resultados abaixo e gere insights personalizados para o usuário.\n\n` +
    `Média Geral de Acertos: ${stats.averageScore}%\n` +
    `Quizzes Realizados: ${stats.quizzesTaken}\n` +
    `Desempenho por Tópico: ${JSON.stringify(summarized.map(a => ({ topic: a.topic, score: Math.round((a.score / a.totalQuestions) * 100) })))}\n`;

  // Gera hash do prompt para cache
  const promptHash = hashPrompt(prompt);
  const cacheRef = db.collection('insightsCache').doc(promptHash);
  let cached = await cacheRef.get();
  if (cached.exists) {
    return res.json({ insight: cached.data().response, source: 'cache' });
  }

  // Chamada à Gemini (mock, substitua pela API real)
  let aiResponse = 'Mock: Insight gerado.';
  try {
    // Exemplo de chamada real:
    // const geminiRes = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', { contents: [{ parts: [{ text: prompt }] }] }, { params: { key: process.env.GEMINI_API_KEY } });
    // aiResponse = geminiRes.data.candidates[0]?.content?.parts[0]?.text || aiResponse;
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao chamar IA' });
  }

  // Salva no cache
  await cacheRef.set({ response: aiResponse, createdAt: new Date(), user: req.user.uid });
  res.json({ insight: aiResponse, source: 'gemini' });
});

// Rota para controle de uso (tokens)
app.get('/api/usage', authMiddleware, async (req, res) => {
  const usageRef = db.collection('usageLogs').doc(req.user.uid);
  const usage = await usageRef.get();
  res.json(usage.exists ? usage.data() : { tokens: 0 });
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend Psiquizz rodando!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
