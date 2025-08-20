Documentação Completa do Aplicativo PsiQuizz AI
1. Introdução
O PsiQuizz AI é uma plataforma de estudos inteligente e personalizável, projetada para transformar a maneira como os usuários aprendem e revisam conteúdo. Construído como um Single-Page Application (SPA), ele oferece uma experiência fluida e interativa, combinando a robustez do React e Firebase com o poder da Inteligência Artificial do Google Gemini.

O aplicativo permite que os usuários criem quizzes personalizados, analisem seu desempenho, gerenciem uma biblioteca de materiais de estudo e conversem com uma mentora de IA, a "Izy", que oferece suporte contextualizado e em tempo real.

2. Arquitetura Geral
Frontend
O coração do PsiQuizz AI é sua interface de usuário, construída com React. Essa escolha permite a criação de uma UI reativa e componentizada. A estilização é feita com Tailwind CSS, garantindo um design moderno, responsivo e de fácil manutenção.

Backend (Backend as a Service - BaaS)
O aplicativo adota uma arquitetura "serverless", utilizando os serviços do Firebase como seu backend. Isso simplifica o desenvolvimento e a escalabilidade. Os serviços utilizados são:

Firebase Authentication: Gerencia todo o ciclo de vida do usuário, incluindo cadastro, login (com Email/Senha e Google) e segurança das sessões.

Cloud Firestore: Um banco de dados NoSQL flexível e escalável que armazena todos os dados da aplicação, desde informações do usuário até históricos de quizzes e conversas.

3. Estrutura do Banco de Dados (Cloud Firestore)
A organização dos dados no Firestore é crucial para a segurança e personalização. A estrutura é centrada no usuário, garantindo que os dados de cada pessoa sejam isolados e acessíveis apenas por ela.

users/{userId}: Coleção principal onde cada documento representa um usuário.

quizHistory/{quizId}: Subcoleção que armazena cada quiz realizado pelo usuário. Cada documento contém o tópico, a pontuação, as perguntas e as respostas dadas.

library/{materialId}: Subcoleção para os materiais de estudo. Cada documento contém o nome do arquivo e seu conteúdo textual completo, extraído no momento do upload.

chatHistory/{messageId}: Subcoleção que guarda o histórico de conversas com a Izy. Cada documento representa uma mensagem, contendo o papel (user ou assistant), o conteúdo e um timestamp para manter a ordem cronológica.

settings/{prompts}: Documento único dentro de uma subcoleção settings que armazena os prompts de IA personalizáveis pelo usuário (para o gerador de quiz, o tutor de análise e a mentora Izy).

As Regras de Segurança do Firestore são configuradas para garantir que um usuário autenticado (request.auth.uid) só possa ler e escrever documentos que estejam sob seu próprio userId.

4. Funcionalidades Detalhadas
a. Sistema de Autenticação
Visão do Usuário: Uma tela de login limpa permite que o usuário entre com seu email e senha ou com sua conta do Google. A mesma tela serve para criar uma nova conta.

Implementação Técnica: O componente AuthPage gerencia o estado de login/registro. O onAuthStateChanged é o principal listener do Firebase no componente App, que detecta mudanças no estado de autenticação e redireciona o usuário ou carrega seus dados.

b. Biblioteca de Materiais
Visão do Usuário: O usuário pode fazer upload de arquivos .txt, .pdf e .docx. Os arquivos aparecem em uma lista e podem ser usados para gerar quizzes ou discutidos no chat.

Implementação Técnica: A extração de texto é feita inteiramente no navegador (client-side) para otimizar a performance e reduzir a complexidade do backend.

PDF.js: Biblioteca usada para ler o conteúdo de arquivos PDF.

Mammoth.js: Biblioteca usada para extrair o texto de documentos .docx.

O texto extraído é então salvo como uma string em um novo documento na subcoleção library do usuário no Firestore.

c. Chat com a Mentora Izy: O Padrão Ouro da Aplicação
Esta é a funcionalidade mais avançada, combinando personalização, acesso a dados e busca em tempo real.

Visão do Usuário: Uma interface de chat onde o usuário pode conversar com a mentora Izy. É possível selecionar um arquivo da biblioteca para que a conversa seja focada nele. O histórico é salvo e pode ser limpo.

Implementação Técnica (Passo a Passo da Excelência):

Construção de Contexto Dinâmico: Antes de enviar a pergunta do usuário para a API, o aplicativo monta um "super prompt". Esse prompt começa com o prompt base da Izy, definido nas configurações do usuário.

Injeção de Dados do Usuário: O prompt é enriquecido com dados atuais do usuário: seu nome, um resumo do seu desempenho nos quizzes e a lista de materiais que ele possui na biblioteca.

Contexto de Arquivo: Se o usuário selecionou um arquivo no menu dropdown, o conteúdo desse arquivo é adicionado ao prompt. Isso permite que a Izy "leia" e discuta o material específico.

Busca em Tempo Real: A chamada para a API Gemini é feita com a ferramenta google_search_retrieval ativada. Isso dá à Izy a capacidade de pesquisar na internet em tempo real para responder a perguntas que vão além do contexto fornecido, garantindo respostas sempre atualizadas.

Persistência: Cada mensagem enviada e recebida é salva como um documento na subcoleção chatHistory no Firestore, garantindo que a conversa seja retomada de onde parou.

d. Configurações de IA
Visão do Usuário: Uma área simples com três caixas de texto onde o usuário pode editar as "instruções-mãe" que guiam o comportamento da IA em cada uma de suas funções.

Implementação Técnica: As alterações são salvas no documento settings/prompts do usuário. Antes de cada chamada à API (seja para gerar um quiz, analisar resultados ou conversar com a Izy), o aplicativo lê o prompt correspondente desse documento, garantindo que a personalização do usuário seja sempre aplicada.

5. Conclusão
O PsiQuizz AI representa uma aplicação moderna e robusta que vai além de um simples gerador de quizzes. Ao integrar de forma inteligente o Firebase para gerenciamento de dados e a API Gemini para IA contextualizada e personalizável, ele oferece uma experiência de estudo verdadeiramente interativa e eficaz. A combinação de funcionalidades, desde a análise de desempenho até o chat com a mentora Izy, cria um ecossistema de aprendizado completo e centrado no usuário.