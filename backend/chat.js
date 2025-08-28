import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';
import pkg from 'lz-string';
const { compress, decompress } = pkg;
import crypto from 'crypto';

const router = express.Router();

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

// Função utilitária: gera hash do prompt para cache
function hashPrompt(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Rota principal para chat
router.post('/api/chat', authMiddleware, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Mensagens ausentes' });

  // Compacta e resume contexto
  const context = messages.slice(-10); // Mantém só as últimas 10 mensagens
  const prompt = context.map(m => `${m.role}: ${m.content}`).join('\n');

  // Gera hash do prompt para cache
  const promptHash = hashPrompt(prompt);
  const db = admin.firestore();
  const cacheRef = db.collection('chatCache').doc(promptHash);
  let cached = await cacheRef.get();
  if (cached.exists) {
    return res.json({ reply: cached.data().response, source: 'cache' });
  }

  // Chamada à Gemini (mock, substitua pela API real)
  let aiResponse = 'Mock: Resposta do chat.';
  try {
    // Exemplo de chamada real:
    // const geminiRes = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', { contents: [{ parts: [{ text: prompt }] }] }, { params: { key: process.env.GEMINI_API_KEY } });
    // aiResponse = geminiRes.data.candidates[0]?.content?.parts[0]?.text || aiResponse;
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao chamar IA' });
  }

  // Salva no cache
  await cacheRef.set({ response: aiResponse, createdAt: new Date(), user: req.user.uid });
  res.json({ reply: aiResponse, source: 'gemini' });
});

export default router;
