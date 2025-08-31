# Backend Psiquizz-AI-Pro-Chat

## Descrição

API Express para redução de consumo de tokens, cache de respostas, controle de uso e integração com Gemini AI.

## Rotas

- `POST /api/insights` - Gera insights de estudo a partir dos dados do usuário, com compactação, cache e chamada à IA.
- `GET /api/usage` - Consulta o uso de tokens do usuário.
- `GET /` - Teste de saúde da API.

## Configuração

1. Crie um arquivo `.env` baseado em `.env.example`.
2. Adicione sua chave Gemini e credenciais do Firebase.
3. Instale dependências:

   ```bash
   cd backend
   npm install
   ```

4. Inicie o servidor:

   ```bash
   npm start
   ```

## Integração Frontend

- Envie dados de tentativas e estatísticas para `/api/insights`.
- Use o token do Firebase Auth no header `Authorization: Bearer <token>`.
- Receba insights otimizados e fonte (cache/gemini).

## Expansão

- Adicione rotas para quizzes, chat, embeddings, etc.
- Implemente controle de uso avançado e billing.
- Integre com WebLLM/transformers.js para fallback local.

## Segurança

- Regras restritivas no Firestore.
- Sanitização de campos.
- Criptografia opcional.

---

Dúvidas ou sugestões? Solicite exemplos ou integração específica!
