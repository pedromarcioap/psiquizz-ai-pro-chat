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
  const { messages, selectedApiProvider, openRouterConfig, huggingFaceConfig, useWebSearch } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Mensagens ausentes' });

  const db = admin.firestore();

  // Prepare messages for AI models (adjusting 'conteudo' to 'content' for some APIs)
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.conteudo // Assuming 'conteudo' is the message content
  }));

  // Generate a hash for caching based on messages and selected provider/model
  const cacheKey = JSON.stringify({ messages: formattedMessages, selectedApiProvider, openRouterConfig, huggingFaceConfig, useWebSearch });
  const promptHash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  const cacheRef = db.collection('chatCache').doc(promptHash);
  let cached = await cacheRef.get();
  if (cached.exists) {
    return res.json({ reply: cached.data().response, source: 'cache' });
  }

  let aiResponse = 'Não foi possível obter resposta.';
  let source = selectedApiProvider;

  try {
    let finalMessages = [...formattedMessages]; // Clone to avoid modifying original

    // Helper function to perform web search (Google Custom Search API)
    async function performWebSearch(query) {
      if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
        console.warn('GOOGLE_SEARCH_API_KEY ou GOOGLE_SEARCH_ENGINE_ID não configurados. A pesquisa na web será ignorada.');
        return [];
      }
      try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
            q: query,
            num: 3, // Number of results to fetch
          },
        });
        return response.data.items || [];
      } catch (error) {
        console.error('Erro ao realizar pesquisa na web:', error.response?.data || error.message);
        return [];
      }
    }

    // Helper function to summarize search results
    function summarizeSearchResults(results) {
      if (!results || results.length === 0) {
        return "Nenhuma informação relevante encontrada na web.";
      }
      let summary = "Informações da web:\n";
      results.forEach((item, index) => {
        summary += `${index + 1}. Título: ${item.title}\n`;
        summary += `   URL: ${item.link}\n`;
        summary += `   Snippet: ${item.snippet}\n\n`;
      });
      return summary;
    }

    if (useWebSearch && selectedApiProvider !== 'gemini') { // Gemini handles web search internally
      const searchQuery = messages[messages.length - 1].conteudo; // Last user message
      const searchResults = await performWebSearch(searchQuery);
      const summarizedResults = summarizeSearchResults(searchResults);
      finalMessages.unshift({ role: 'system', content: summarizedResults });
    }

    if (selectedApiProvider === 'gemini') {
      const geminiModel = useWebSearch ? 'gemini-1.5-pro' : 'gemini-pro'; // Or 'gemini-1.5-flash'
      const contents = formattedMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
        { contents: contents },
        { params: { key: process.env.GEMINI_API_KEY } }
      );
      aiResponse = geminiRes.data.candidates[0]?.content?.parts[0]?.text || aiResponse;
    } else if (selectedApiProvider === 'openrouter') {
      if (!openRouterConfig.apiKey || !openRouterConfig.model) {
        throw new Error('OpenRouter API Key ou Modelo não configurados.');
      }
      const openRouterRes = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: openRouterConfig.model,
          messages: finalMessages,
        },
        {
          headers:
            {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use backend's env var
              'Content-Type': 'application/json',
            },
        }
      );
      aiResponse = openRouterRes.data.choices[0]?.message?.content || aiResponse;
    } else if (selectedApiProvider === 'huggingface') {
      if (!huggingFaceConfig.apiKey || !huggingFaceConfig.model) {
        throw new Error('Hugging Face API Key ou Modelo não configurados.');
      }
      // Hugging Face Inference API often expects a simple string input for text generation
      const hfPrompt = finalMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const huggingFaceRes = await axios.post(
        `https://api-inference.huggingface.co/models/${huggingFaceConfig.model}`,
        { inputs: hfPrompt },
        {
          headers:
            {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Use backend's env var
            },
        }
      );
      aiResponse = huggingFaceRes.data[0]?.generated_text || aiResponse;
    }
  } catch (err) {
    console.error(`Erro ao chamar IA (${selectedApiProvider}):`, err.response?.data || err.message);
    return res.status(500).json({ error: `Erro ao chamar IA (${selectedApiProvider}): ` + (err.response?.data?.error || err.message) });
  }

  // Salva no cache
  await cacheRef.set({ response: aiResponse, createdAt: new Date(), user: req.user.uid });
  res.json({ reply: aiResponse, source: source });
});

export default router;
