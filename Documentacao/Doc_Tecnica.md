Documentação Técnica Detalhada: PsiQuizz AI
1. Visão Geral da Arquitetura e Fluxo de Dados
O PsiQuizz AI é um Single-Page Application (SPA) construído em React. A arquitetura é "serverless", onde o frontend se comunica diretamente com os serviços do Firebase (Backend-as-a-Service).

Componente Central (App.js): Atua como o orquestrador principal. Ele gerencia o estado de autenticação do usuário, controla qual página é exibida e detém as funções de lógica de negócios que interagem com o Firebase e as APIs do Google.

Fluxo de Dados: Os dados são unidirecionais. O App.js busca os dados do Firestore, os armazena em seu estado (useState) e os passa como props para os componentes filhos (as páginas). Quando uma ação em uma página precisa modificar os dados (ex: adicionar um item à biblioteca), ela chama uma função passada por props pelo App.js, que executa a lógica de escrita no Firestore e atualiza o estado central, fazendo com que a UI seja renderizada novamente com os novos dados.

2. Core do Aplicativo: App.js
Este componente é a espinha dorsal da aplicação.

Gerenciamento de Estado Principal: Utiliza useState para controlar:

user: O objeto do usuário autenticado.

currentPage: A página/componente a ser renderizado.

quizHistory, libraryItems, chatHistory: Arrays que contêm os dados do usuário carregados do Firestore.

prompts: Um objeto com os prompts de IA personalizáveis.

isLoading, loadingUser: Booleans para controlar a exibição de indicadores de carregamento.

Gerenciamento de Autenticação:

useEffect com onAuthStateChanged observa o estado de login do usuário em tempo real.

Login: Quando um currentUser é detectado, a função loadUserData é chamada para buscar todos os dados associados àquele userId.

Logout: Quando currentUser é null, os estados de dados do usuário são limpos.

Roteamento de Páginas:

A função renderPage() utiliza uma estrutura switch (currentPage) para determinar qual componente de página (ex: <HomePage>, <ChatPage>) deve ser exibido. A navegação é controlada pela função handleNavigate, que simplesmente atualiza o estado currentPage.

3. Módulo de Autenticação (AuthPage.js)
Responsabilidade: Fornecer a interface para login e registro.

Lógica:

handleEmailSubmit: Chama as funções signInWithEmailAndPassword ou createUserWithEmailAndPassword do Firebase Auth.

handleGoogleSignIn: Utiliza GoogleAuthProvider e signInWithPopup para o fluxo de login com o Google.

Criação de Usuário no Firestore: A criação do registro de dados de um novo usuário no Firestore não ocorre aqui. Ela é tratada de forma inteligente pela função loadUserData em App.js. Quando onAuthStateChanged detecta um novo login, loadUserData verifica se um documento para aquele userId já existe. Se não existir, ele cria a estrutura inicial de dados (documento do usuário, prompts padrão, etc.), garantindo que o app não quebre para novos usuários.

4. Módulo da Biblioteca (LibraryPage.js)
Responsabilidade: Permitir o upload e gerenciamento de materiais de estudo.

Fluxo de Upload e Parsing (Client-Side):

Carregamento Dinâmico de Scripts: Um useEffect carrega as bibliotecas pdf.js e mammoth.js dinamicamente ao montar o componente, evitando carregar scripts pesados desnecessariamente em outras partes do app.

Seleção de Arquivo: O onChange do input de arquivo dispara a função handleFileChange.

Leitura do Arquivo: A FileReader API do navegador é usada para ler o arquivo.

Extração de Texto:

Se for .txt, o conteúdo é lido diretamente.

Se for .pdf, pdfjsLib.getDocument() é usado para processar o arquivo e extrair o texto de cada página.

Se for .docx, mammoth.extractRawText() é usado para a extração.

Atualização de Estado: O texto extraído é salvo no estado local do componente.

Persistência: Ao clicar em "Adicionar", a função onAddItem (vinda de App.js) é chamada, e ela executa o addDoc para salvar o nome e o conteúdo no Firestore, na subcoleção library do usuário.

5. Módulo do Chat com Izy (ChatPage.js e handleSendMessageToAI)
Esta é a funcionalidade mais complexa e poderosa, integrando múltiplos contextos.

Componente ChatPage.js:

UI: Renderiza o histórico de mensagens (chatHistory recebido via props). Gerencia o input do usuário e o select para escolher um material da biblioteca.

Ação: Ao enviar uma mensagem, chama a função onSendMessage (que é a handleSendMessageToAI de App.js), passando o texto da mensagem e o ID do material selecionado.

Função handleSendMessageToAI em App.js (Fluxo Detalhado):

Atualização Otimista: A mensagem do usuário é imediatamente adicionada ao estado chatHistory e renderizada na tela. Isso proporciona uma experiência de usuário instantânea.

Persistência (Usuário): A mensagem do usuário é salva no Firestore na subcoleção chatHistory com um timestamp.

Construção do Contexto:

Um context base é criado com informações do usuário (nome, resumo de performance).

Se um selectedMaterialId foi passado, o app busca o material correspondente no estado libraryItems e anexa seu conteúdo ao contexto, informando à IA o nome do arquivo.

Montagem do Prompt Final: O prompt personalizável da Izy (vindo do estado prompts.chat) é usado como um template. As variáveis {context} e {input} são substituídas pelos dados montados.

Chamada à API Gemini:

O payload é montado com o finalPrompt.

Crucialmente, o objeto tool_config é adicionado para habilitar a busca em tempo real:

"tool_config": {
  "google_search_retrieval": {}
}

Tratamento da Resposta: O código verifica se a resposta da API é válida e contém texto.

Persistência (IA): A resposta da Izy é salva no Firestore, também com um timestamp.

Atualização Final da UI: A resposta da Izy é adicionada ao estado chatHistory, fazendo com que ela apareça na tela.

Tratamento de Erros: Se qualquer etapa falhar, uma mensagem de erro é gerada e salva no histórico para informar o usuário.

Histórico e Exclusão:

O carregamento do histórico é feito em loadUserData, que busca a coleção chatHistory e a ordena por timestamp.

A função handleClearChatHistory busca todos os documentos na coleção de chat do usuário e os deleta um por um.

6. Módulo de Configurações (SettingsPage.js)
Responsabilidade: Permitir a personalização do comportamento da IA.

Lógica:

Carregamento: Ao montar, o componente é populado com os prompts vindos do estado prompts (que foi carregado de settings/prompts no Firestore).

Edição: O usuário edita os prompts em campos de textarea.

Salvamento: Ao clicar em "Salvar", a função onSavePrompts (handleSavePrompts em App.js) é chamada. Ela usa setDoc para sobrescrever o documento settings/prompts com os novos valores, garantindo que futuras chamadas de API usem as novas instruções.