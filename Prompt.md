Prompt para Reconstrução Completa do Aplicativo PsiQuizz AI
Objetivo: Criar um aplicativo web completo, do tipo Single-Page Application (SPA), chamado PsiQuizz AI. O aplicativo será uma plataforma de estudos inteligente e personalizada, desenvolvida em português brasileiro.

1. Especificações Técnicas
Frontend: React (com Hooks) e Tailwind CSS para estilização.

Backend & Banco de Dados: Firebase (BaaS - Backend as a Service).

Autenticação: Firebase Authentication (provedores: Email/Senha e Google Sign-In).

Banco de Dados: Cloud Firestore (NoSQL).

APIs de IA:

Google Gemini API: Para geração de quizzes, análise de resultados e lógica do chat.

Google Search API (via Gemini Tools): Para busca de informações em tempo real no chat.

Bibliotecas Externas:

pdf.js: Para extração de texto de arquivos PDF no lado do cliente.

mammoth.js: Para extração de texto de arquivos .docx no lado do cliente.

2. Estrutura do Banco de Dados (Cloud Firestore)
A estrutura deve ser centrada no usuário, com todos os dados armazenados em subcoleções dentro do documento de cada usuário.

Coleção Principal: users

Documento: {userId} (ID do usuário do Firebase Auth)

Subcoleção quizHistory: Armazena o histórico de quizzes. Cada documento representa um quiz finalizado.

Subcoleção library: Armazena os materiais de estudo. Cada documento contém o nome e o conteúdo textual de um arquivo enviado.

Subcoleção chatHistory: Armazena o histórico de mensagens com a mentora Izy. Cada documento é uma mensagem com role, content e timestamp.

Subcoleção settings:

Documento prompts: Armazena os prompts personalizáveis da IA (quiz, tutor, chat).

Regras de Segurança: Implementar regras que permitam que um usuário autenticado leia e escreva apenas em seus próprios documentos (ex: match /users/{userId}/{documents=**} { allow read, write: if request.auth.uid == userId; }).

3. Funcionalidades Principais
a. Autenticação de Usuários:

Uma página de login que alterna entre "Entrar" e "Criar Conta".

Opções de login com Email/Senha e um botão "Entrar com Google".

Após o login, o aplicativo deve carregar os dados específicos do usuário do Firestore.

b. Dashboard (Página Inicial):

Exibir um resumo de performance do usuário: média de acertos, quizzes realizados, total de questões.

Mostrar uma lista das atividades recentes (últimos 3 quizzes).

Incluir uma área de "Recomendação do Dia" para motivar o estudo.

c. Geração de Quizzes:

Um formulário para o usuário definir: Tópico, Subtópicos, Dificuldade, Nº de Questões e Nº de Alternativas.

Opção para gerar o quiz com base em um material da biblioteca do usuário.

A chamada para a Gemini API deve usar o prompt personalizável de settings e solicitar um JSON com question, options, correctAnswer e uma explanation didática para cada questão.

d. Modo de Estudo:

Apresentar uma questão por vez com uma barra de progresso.

Após a seleção de uma resposta, revelar imediatamente se está correta ou incorreta e exibir a explanation fornecida pela IA.

e. Biblioteca de Materiais:

Permitir o upload de arquivos .txt, .pdf e .docx.

A extração de texto deve ocorrer no frontend (client-side) usando as bibliotecas pdf.js e mammoth.js.

Os materiais extraídos (nome e conteúdo) devem ser salvos no Firestore do usuário.

f. Chat com a Mentora "Izy":

Criar uma página de chat com histórico de mensagens persistente (salvo no Firestore).

A mentora Izy deve usar um prompt personalizável de settings.

Contextualização: O prompt enviado à Gemini API deve incluir:

Contexto geral do usuário (nome, estatísticas de quizzes).

Um menu dropdown que permite ao usuário selecionar um arquivo da biblioteca para discutir. Se um arquivo for selecionado, seu conteúdo deve ser incluído no prompt.

Busca em Tempo Real: A chamada à API deve habilitar a ferramenta de google_search_retrieval para que Izy possa responder a perguntas gerais com informações atualizadas.

Adicionar um botão para limpar o histórico do chat com uma janela de confirmação.

g. Configurações de IA:

Uma página onde o usuário pode visualizar e editar os três prompts principais:

Prompt do Gerador de Quizz.

Prompt do Tutor de Análise de Resultados.

Prompt da Mentora Izy (Chat).

As alterações devem ser salvas no Firestore e usadas em tempo real pelo aplicativo.

4. Diretrizes de Estilo e UI/UX
Cores: Primária: Azul claro (#ADD8E6), Fundo: Azul muito claro (#F0F8FF), Destaque positivo: Verde suave (#90EE90).

Fonte: 'PT Sans' para todo o aplicativo.

Layout: Limpo, minimalista e de página única para uma experiência fluida.

Ícones: Usar ícones SVG limpos e modernos para navegação e elementos de UI.

Rodapé: Deve conter o texto "Criado com 💛🌻 por Pedro Márcio".

Navegação: O cabeçalho deve ter links para "Dashboard", "Chat com Izy", "Novo Quizz", "Biblioteca" e "Configurações".