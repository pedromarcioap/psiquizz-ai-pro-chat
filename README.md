# Psiquizz AI

Um aplicativo de chat com IA e geração de quizzes personalizados para estudo.

## Descrição

O Psiquizz AI é uma plataforma de estudos inteligente e personalizável, projetada para transformar a maneira como os usuários aprendem e revisam conteúdo. Construído como um Single-Page Application (SPA), ele oferece uma experiência fluida e interativa, combinando a robustez do React e Firebase com o poder da Inteligência Artificial do Google Gemini.

O aplicativo permite que os usuários criem quizzes personalizados, analisem seu desempenho, gerenciem uma biblioteca de materiais de estudo e conversem com uma mentora de IA, a "Izy", que oferece suporte contextualizado e em tempo real.

## Funcionalidades

- **Sistema de Autenticação**: Login/registro com email e senha ou conta Google
- **Biblioteca de Materiais**: Upload e gerenciamento de arquivos .txt, .pdf e .docx
- **Geração de Quizzes**: Criação de quizzes personalizados com base em tópicos ou materiais da biblioteca
- **Modo de Estudo**: Interface interativa para responder perguntas e receber feedback imediato
- **Chat com Izy**: Conversa com uma mentora de IA que pode acessar materiais da biblioteca e buscar informações em tempo real
- **Configurações de IA**: Personalização dos prompts que guiam o comportamento da IA
- **Dashboard**: Visão geral do desempenho do usuário e atividades recentes

## Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase (Autenticação e Firestore)
- **IA**: Google Gemini API
- **Extração de Texto**: pdf.js, mammoth.js

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── services/           # Configuração de serviços (Firebase, APIs)
├── utils/              # Funções utilitárias
├── App.js              # Componente principal
├── index.js            # Ponto de entrada
└── index.css           # Estilos globais
```

## Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (veja `.env.example` para um exemplo):
   ```
   REACT_APP_FIREBASE_API_KEY=sua_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=sua_app_id
   REACT_APP_GEMINI_API_KEY=sua_gemini_api_key
   ```

4. Inicie o aplicativo:
   ```bash
   npm start
   ```

## Uso

1. Faça login ou crie uma conta
2. Adicione materiais de estudo na Biblioteca
3. Gere quizzes personalizados com base em tópicos ou materiais
4. Estude respondendo às perguntas no Modo de Estudo
5. Converse com a mentora Izy no chat para tirar dúvidas
6. Personalize o comportamento da IA nas Configurações

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Pedro Márcio - pedro@example.com

Link do Projeto: [https://github.com/seu-usuario/psiquizz-ai](https://github.com/seu-usuario/psiquizz-ai)