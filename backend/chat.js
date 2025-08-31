import express from 'express';
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

// Função utilitária: gera hash do prompt para cache (Keep if still used by insights)
function hashPrompt(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Rota principal para chat
router.post('/api/chat', authMiddleware, async (req, res) => { // authMiddleware will be imported
  const { messages, selectedApiProvider, openRouterConfig, huggingFaceConfig, useWebSearch } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Mensagens ausentes' });

  // const db = admin.firestore(); // REMOVE

  // Prepare messages for AI models (adjusting 'conteudo' to 'content' for some APIs)
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.conteudo // Assuming 'conteudo' is the message content
  }));

  // Generate a hash for caching based on messages and selected provider/model
  // const cacheKey = JSON.stringify({ messages: formattedMessages, selectedApiProvider, openRouterConfig, huggingFaceConfig, useWebSearch });
  // const promptHash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  // const cacheRef = db.collection('chatCache').doc(promptHash); // REMOVE
  // let cached = await cacheRef.get(); // REMOVE
  // if (cached.exists) { // REMOVE
  //   return res.json({ reply: cached.data().response, source: 'cache' }); // REMOVE
  // } // REMOVE

  let aiResponse = 'Não foi possível obter resposta.';
  let source = selectedApiProvider;

  try {
    let finalMessages = [...formattedMessages]; // Clone to avoid modifying original

    // --- Web Search Integration (Real Implementation Required) ---
    // To enable real web search for OpenRouter/Hugging Face, you need to:
    // 1. Choose a Web Search API (e.g., Brave Search API, SerpApi, Serper.dev, Google Custom Search API).
    //    - Free tiers are often limited.
    // 2. Obtain an API Key for your chosen service.
    // 3. Implement the actual API call here.
    // 4. Set the API Key as an environment variable (e.g., process.env.WEB_SEARCH_API_KEY).

    async function performWebSearch(query) {
      console.warn('Web search function is a placeholder. Implement a real web search API call here.');
      // Example: Call to a real web search API
      /*
      try {
        const response = await axios.get('YOUR_WEB_SEARCH_API_ENDPOINT', {
          params: {
            q: query,
            api_key: process.env.WEB_SEARCH_API_KEY,
            // ... other parameters
          },
        });
        // Process response and return relevant snippets/links
        return [{ title: "Exemplo de Resultado", link: "http://example.com", snippet: "Este é um snippet de exemplo de uma pesquisa na web." }];
      } catch (error) {
        console.error('Error performing web search:', error.response?.data || error.message);
        return [];
      }
      */
      return []; // Return empty array if no real search is performed
    }

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
      if (summarizedResults !== "Nenhuma informação relevante encontrada na web.") {
        finalMessages.unshift({ role: 'system', content: summarizedResults });
      }
    }
    // --- End Web Search Integration ---

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
              'Authorization': `Bearer ${openRouterConfig.apiKey}`, // Use key from frontend config
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
              'Authorization': `Bearer ${huggingFaceConfig.apiKey}`, // Use key from frontend config
            },
        }
      );
      aiResponse = huggingFaceRes.data[0]?.generated_text || aiResponse;
    }
  } catch (err) {
    console.error(`Erro ao chamar IA (${selectedApiProvider}):`, err.response?.data || err.message);
    return res.status(500).json({ error: `Erro ao chamar IA (${selectedApiProvider}): ` + (err.response?.data?.error || err.message) });
  }

  // Salva no cache (Firestore caching removed)
  // await cacheRef.set({ response: aiResponse, createdAt: new Date(), user: req.user.uid });
  res.json({ reply: aiResponse, source: source });
});

export default router;