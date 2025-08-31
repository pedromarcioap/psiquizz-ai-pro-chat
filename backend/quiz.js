import express from 'express';
// import admin from 'firebase-admin'; // REMOVE
import axios from 'axios';
import pkg from 'lz-string';
const { compress, decompress } = pkg;
import crypto from 'crypto';
import { authMiddleware } from './index.js'; // Import authMiddleware

const router = express.Router();

// REMOVE LOCAL authMiddleware DEFINITION (it should be imported from index.js)
// async function authMiddleware(req, res, next) {
//   const token = req.headers.authorization?.split('Bearer ')[1];
//   if (!token) return res.status(401).json({ error: 'Token ausente' });
//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Token inválido' });
//   }
// }

// Função utilitária: gera hash do prompt para cache
function hashPrompt(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Rota principal para geração de quiz
router.post('/api/quiz', authMiddleware, async (req, res) => {
  const { preferences } = req.body;
  if (!preferences) return res.status(400).json({ error: 'Preferências ausentes' });

  // Compacta e resume preferências
  const prompt = `Gere um quiz com base nas preferências: ${JSON.stringify(preferences)}`;

  // Gera hash do prompt para cache (Firestore caching removed)
  // const db = admin.firestore(); // REMOVE
  // const promptHash = hashPrompt(prompt); // Keep hashPrompt if needed for other caching
  // const cacheRef = db.collection('quizCache').doc(promptHash); // REMOVE
  // let cached = await cacheRef.get(); // REMOVE
  // if (cached.exists) { // REMOVE
  //   return res.json({ quiz: cached.data().response, source: 'cache' }); // REMOVE
  // } // REMOVE

  // Chamada à Gemini (mock, substitua pela API real)
  let aiResponse = 'Mock: Quiz gerado.';
  try {
    // Exemplo de chamada real:
    // const geminiRes = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', { contents: [{ parts: [{ text: prompt }] }] }, { params: { key: process.env.GEMINI_API_KEY } });
    // aiResponse = geminiRes.data.candidates[0]?.content?.parts[0]?.text || aiResponse;
  } catch (err) {
    console.error('Erro ao chamar IA para quiz:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Erro ao chamar IA' });
  }

  // Salva no cache (Firestore caching removed)
  // await cacheRef.set({ response: aiResponse, createdAt: new Date(), user: req.user.uid }); // REMOVE
  res.json({ quiz: aiResponse, source: 'gemini' });
});

export default router;