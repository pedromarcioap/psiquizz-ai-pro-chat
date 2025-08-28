// embeddings.js - embeddings locais com transformers.js
// Exemplo de uso: gerar embeddings no browser
// Necessário instalar transformers.js

export async function getEmbeddings(texts) {
  // Aqui você pode integrar com transformers.js ou WebLLM
  // Exemplo fictício:
  // const model = await transformers.load('Xenova/all-MiniLM-L6-v2');
  // return await model.embed(texts);
  return texts.map(t => ({ text: t, embedding: [0, 1, 2] })); // mock
}
