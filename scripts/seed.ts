// scripts/seed.ts
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch, Timestamp } from "firebase/firestore";

// Substiua pelas credenciais do seu Firebase (ou importe a config se preferir)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const TARGET_USER_IDS = [
  "a5DJRa9d2ldaui7b9p3DKZbPCXR2",
  "k8Lp9Xm2Nq1vW4zT7bR5yC3dF6jA",
  "m3vR8zP1Yk9wX2tQ5bL7nC4dF6jK",
];

const getRandomTargetUserId = () =>
  TARGET_USER_IDS[Math.floor(Math.random() * TARGET_USER_IDS.length)];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleTitles = [
  "Qual a melhor biblioteca de estado no React?",
  "Qual o melhor banco de dados para Serverless?",
  "Preferência de CSS no ecossistema Web",
  "Qual o seu ecossistema de testes favorito?",
  "Qual a melhor plataforma de Deploy Frontend?",
  "Qual a linguagem backend preferida em 2026?",
  "Qual a melhor ferramenta de Build?",
  "Preferência de runtime JavaScript",
  "Qual o melhor framework Fullstack?",
  "Qual a melhor biblioteca de componentes UI?",
  "Qual o melhor gerenciador de pacotes?",
  "Qual o editor de código mais utilizado?",
  "Uso de IA no fluxo de desenvolvimento",
  "Qual o formato preferido de API?",
  "Qual a melhor ferramenta de prototipação?",
  "Qual a sua estratégia preferida de renderização no Next.js?",
  "Qual a melhor solução de autenticação para Web?",
  "Qual o melhor banco de dados relacional?",
  "Qual o melhor banco de dados NoSQL?",
  "Qual a sua linguagem de programação principal?",
  "Qual o melhor framework para desenvolvimento Mobile?",
  "Preferência entre TypeScript e JavaScript puro",
  "Qual a ferramenta ideal para documentação de API?",
  "Qual a melhor biblioteca de animação na Web?",
  "Qual o principal provedor de nuvem utilizado?",
  "Qual a melhor ferramenta de CI/CD?",
  "Qual a sua ferramenta de monitoramento e logs favorita?",
  "Qual o formato de container mais utilizado?",
  "Qual a melhor biblioteca para validação de esquemas?",
  "Qual a sua biblioteca preferida para manipulação de datas?",
  "Preferência de arquitetura: Monólito ou Microsserviços?",
  "Qual o melhor orquestrador de containers?",
  "Qual a sua ferramenta favorita para testes End-to-End?",
  "Qual a melhor alternativa ao Docker atualmente?",
  "Qual o modelo de IA mais utilizado na sua rotina?",
  "Qual o seu assistente de código por IA preferido?",
  "Preferência entre GraphQL, REST e gRPC",
  "Qual a melhor solução de armazenamento de arquivos na nuvem?",
  "Qual o melhor framework CSS Utilitário?",
  "Qual a sua biblioteca de gráficos/charts favorita?",
  "Qual a melhor ferramenta de gerenciamento de estado global no Vue?",
  "Qual a linguagem mais promissora para o futuro do desenvolvimento?",
  "Qual o melhor framework para sistemas embarcados e IoT?",
  "Qual a sua distribuição Linux favorita para desenvolvimento?",
  "Preferência entre consumo de APIs síncronas ou assíncronas",
  "Qual a melhor ferramenta de mensageria e mensageiro de eventos?",
  "Qual o melhor banco de dados vetorial para IA?",
  "Qual o sistema operacional principal na sua máquina de trabalho?",
  "Qual o melhor framework para criação de aplicações Desktop?",
  "Qual a sua extensão de editor indispensável?",
  "Qual a melhor biblioteca para manipulação de formulários?",
  "Qual o melhor framework Web no ecossistema Python?",
  "Qual o melhor framework Web no ecossistema Rust?",
  "Qual o melhor framework Web no ecossistema Go?",
  "Qual a melhor ferramenta de Linting e Formatação de código?",
  "Qual a sua estratégia favorita para cache de requisições?",
  "Preferência por arquitetura orientada a eventos ou requisição/resposta",
  "Qual a melhor biblioteca de ORM/Query Builder para Node.js?",
  "Qual a sua plataforma favorita de hospedagem de código?",
  "Qual a ferramenta ideal para rastreamento de erros em produção?",
  "Qual o melhor motor de busca e analytics de logs?",
  "Qual o método preferido de estilização em aplicações React Native?",
  "Qual a biblioteca de ícones mais utilizada nos seus projetos?",
  "Qual a melhor abordagem para internacionalização (i18n)?",
  "Qual o melhor framework para WebAssembly (Wasm)?",
  "Qual a sua estratégia favorita de segurança em APIs Web?",
  "Qual o seu banco de dados chave-valor preferido?",
  "Qual a melhor biblioteca para gerenciamento de requisições e cache no cliente?",
  "Qual a melhor ferramenta para criação e consumo de WebSockets?",
  "Qual a sua plataforma Serverless de funções preferida?",
  "Qual o melhor gerenciador de versões de linguagem?",
  "Qual o formato de imagens web com melhor desempenho?",
  "Qual a sua biblioteca favorita de testes unitários?",
  "Qual o melhor framework para desenvolvimento de jogos 2D/3D?",
  "Qual a principal métrica de performance web que você monitora?",
  "Qual a ferramenta preferida para análise estática de código?",
  "Qual a sua ferramenta favorita de Feature Flags?",
  "Preferência de terminal e shell no sistema operacional",
  "Qual a melhor ferramenta para design de APIs antes da implementação?",
  "Qual a solução ideal para balanceamento de carga e Proxy Reverso?",
  "Qual o melhor framework para inteligência artificial e Data Science?",
  "Qual a biblioteca preferida para manipulação e processamento de imagens?",
  "Qual o melhor serviço de Gateway de Pagamento para integração?",
  "Qual o método de implantar microsserviços mais seguro?",
  "Qual a sua biblioteca de validação de formulários preferida no React?",
  "Qual a melhor ferramenta para criação de apresentações e slides em código?",
  "Qual o melhor sistema de filas e background jobs?",
  "Qual o seu framework de testes de regressão visual favorito?",
  "Qual a ferramenta de Infrastructure as Code (IaC) mais usada?",
  "Qual a melhor biblioteca para drag-and-drop na web?",
  "Qual o melhor banco de dados para séries temporais (Time Series)?",
  "Qual a sua solução preferida de Search Engine integrada?",
  "Qual o padrão de commits que você adota na sua equipe?",
  "Qual a melhor ferramenta para criação de sites estáticos (SSG)?",
  "Qual a sua estratégia para gerenciamento de Monorepos?",
  "Qual o melhor framework para desenvolvimento cross-platform?",
  "Qual o serviço de envio de e-mails transacionais favorito?",
  "Qual a biblioteca de mapas interativos mais utilizada?",
  "Qual a principal ferramenta de teste de carga e performance?",
  "Qual a melhor biblioteca para geração de PDFs no navegador ou backend?",
  "Qual a sua abordagem preferida para Web Scraping e automação?",
  "Qual o melhor framework para chatbots e agentes autônomos?",
  "Qual a biblioteca de tabelas de dados mais avançada para Web?",
  "Qual a melhor ferramenta para monitoramento de métricas de infraestrutura?",
  "Qual a solução de SSO (Single Sign-On) e Identity Provider ideal?",
  "Qual o melhor motor de renderização de fontes na web?",
  "Qual a sua biblioteca preferida para manipulação de áudio na Web?",
  "Qual o melhor framework Java para desenvolvimento moderno?",
  "Qual o melhor framework .NET para APIs RESTful?",
  "Qual a linguagem de programação funcional favorita?",
  "Qual a melhor ferramenta para criação de documentações técnicas?",
  "Qual a sua estratégia preferida de atualização de dependências?",
  "Qual o melhor bundler para bibliotecas JavaScript?",
  "Qual a biblioteca mais eficiente para manipulação de matrizes e dados numéricos?",
  "Qual a melhor ferramenta para simulação de APIs em ambientes de teste?",
  "Qual o melhor banco de dados embarcado (Embedded DB)?",
  "Qual o seu gerenciador de banco de dados GUI preferido?",
  "Qual o principal desafio no desenvolvimento Frontend em 2026?",
  "Qual o principal desafio no desenvolvimento Backend em 2026?",
  "Qual a ferramenta favorita para diagramação e arquitetura de software?",
  "Qual a melhor biblioteca para manipulação de streams de áudio e vídeo?",
  "Qual o melhor framework para desenvolvimento de extensões de navegador?",
  "Qual a sua solução de Headless CMS favorita?",
  "Qual o melhor serviço de hospedagem para bancos de dados gerenciados?",
  "Qual a biblioteca preferida para renderização 3D na Web?",
  "Qual o melhor framework PHP para desenvolvimento web?",
  "Qual o seu framework Ruby favorito para aplicações escaláveis?",
  "Qual a biblioteca mais utilizada para manipulação de arquivos Excel/CSV?",
  "Qual a melhor ferramenta de análise de acessibilidade Web (a11y)?",
  "Qual a melhor estratégia para mitigação de ataques DDoS e WAF?",
  "Qual o melhor framework para Machine Learning no navegador?",
  "Qual a sua biblioteca favorita para detecção de gestos e toques em telas sensíveis?",
  "Qual a ferramenta preferida para gerenciar secrets e variáveis de ambiente?",
  "Qual o melhor framework para criação de CLI (Command Line Interface)?",
  "Qual o sistema de arquivos e armazenamento em nuvem mais confiável?",
  "Qual a biblioteca de gráficos vetoriais (SVG) mais versátil?",
  "Qual a melhor abordagem para gerenciamento de rotas no Frontend?",
  "Qual a ferramenta favorita de observabilidade de aplicações (APM)?",
  "Qual o framework preferido para construção de ecossistemas Microfrontend?",
  "Qual o melhor banco de dados de grafos para relacionamentos complexos?",
  "Qual a sua biblioteca favorita para Rich Text Editors na Web?",
  "Qual o principal protocolo de comunicação para IoT?",
  "Qual o seu ambiente de desenvolvimento integrado (IDE) favorito?",
  "Qual a melhor ferramenta para perfilamento de memória e CPU?",
  "Qual o método de autenticação sem senha (Passwordless) preferido?",
  "Qual a biblioteca favorita para cálculo de layout e física 2D?",
  "Qual a melhor ferramenta para gerenciamento de conhecimento e notas da equipe?",
  "Qual a sua plataforma de e-commerce Headless preferida?",
  "Qual o melhor framework para desenvolvimento nativo iOS?",
  "Qual o melhor framework para desenvolvimento nativo Android?",
  "Qual a biblioteca de manipulação de imagens canvas mais completa?",
  "Qual o seu banco de dados favorito para caching em memória?",
  "Qual a melhor ferramenta para automação de tarefas de infraestrutura?",
  "Qual a estratégia de branch no Git mais adotada no seu time?",
  "Qual a biblioteca de estilização CSS-in-JS favorita?",
  "Qual o framework web preferido no ecossistema Elixir?",
  "Qual a ferramenta preferida para gerenciamento de projetos ágeis?",
  "Qual a biblioteca ideal para manipulação e análise de dados genômicos/científicos?",
  "Qual a melhor solução para envio de notificações push?",
  "Qual a biblioteca para manipulação de cores e paletas na Web?",
  "Qual o melhor motor de templates para geração de HTML no servidor?",
  "Qual a sua ferramenta favorita para testes de mutação de código?",
  "Qual o serviço de CDN (Content Delivery Network) mais confiável?",
  "Qual a melhor biblioteca para parse e criação de arquivos Markdown?",
  "Qual o banco de dados ideal para sincronização offline-first em mobile?",
  "Qual a biblioteca favorita para visualização de redes e grafos interativos?",
  "Qual o melhor framework para criação de PWA (Progressive Web Apps)?",
  "Qual o seu formato de arquivo de configuração favorito (JSON, YAML, TOML)?",
  "Qual a melhor biblioteca para conversão e manipulação de fusos horários?",
  "Qual a ferramenta de análise de segurança e vulnerabilidade em dependências?",
  "Qual o melhor framework para prototipação rápida de modelos de IA?",
  "Qual a biblioteca favorita para scroll infinito e virtualização de listas?",
  "Qual o seu servidor Web favorito (Nginx, Apache, Caddy)?",
  "Qual a ferramenta preferida para captura de métricas de usuário e Analytics?",
  "Qual o melhor framework para automação de testes de segurança (Pentest)?",
  "Qual a biblioteca preferida para sanitização de inputs e HTML contra XSS?",
  "Qual a melhor ferramenta para geração automática de testes unitários?",
  "Qual a solução ideal para gerenciamento de identidades e acessos (IAM)?",
  "Qual a biblioteca de sintetização e reconhecimento de voz favorita?",
  "Qual o melhor framework para sistemas de tempo real com WebRTC?",
  "Qual a sua ferramenta favorita para monitoramento de disponibilidade (Uptime)?",
  "Qual a melhor biblioteca para estilização utilizando Design Tokens?",
  "Qual o protocolo de autorização mais seguro para APIs públicas?",
  "Qual a ferramenta preferida para benchmarking de código e performance?",
  "Qual a biblioteca de animação baseada em física mais fluida para Web?",
  "Qual o sistema de arquivos distribuído ideal para Big Data?",
  "Qual a melhor plataforma para feedback de usuários e testes A/B?",
  "Qual o framework preferido para criação de dashboards administrativos?",
  "Qual a biblioteca de compressão e descompressão de dados mais rápida?",
  "Qual a ferramenta ideal para simulação e teste de latência de rede?",
  "Qual o melhor framework para desenvolvimento em C++ moderno?",
  "Qual a biblioteca favorita para integração com carteiras Crypto e Web3?",
  "Qual a melhor ferramenta para criação de infográficos e gráficos de dados interativos?",
  "Qual a solução de armazenamento de sessões de usuário mais escalável?",
  "Qual a biblioteca de parsing de SQL e manipulação de ASTs preferida?",
  "Qual o melhor framework para processamento distribuído de dados em larga escala?",
  "Qual a ferramenta ideal para rastreamento de custos e consumo em nuvem?",
  "Qual a biblioteca para integração com WebSockets no servidor em Node.js?",
  "Qual o melhor framework para orquestração de pipelines de dados (ETL)?",
  "Qual a ferramenta favorita para governança e conformidade de código?",
];

const statuses = [
  "não iniciado",
  "iniciado",
  "em andamento",
  "finalizado",
] as const;

async function seedDatabase() {
  console.log("🚀 Iniciando povoamento do banco de dados...");
  const batch = writeBatch(db);

  const pollIds: string[] = [];

  // 1. Criar Enquetes
  for (let i = 0; i < sampleTitles.length; i++) {
    const pollRef = doc(db, "polls", `seed-poll-${i + 1}`);
    const pollId = pollRef.id;
    pollIds.push(pollId);

    const now = new Date();
    const startDate = new Date(now.getTime() - (15 - i) * 86400000); // Datas retroativas
    const endDate = new Date(now.getTime() + (i + 1) * 86400000);

    const status = statuses[i % statuses.length];

    const pollData = {
      title: sampleTitles[i],
      createdBy: getRandomTargetUserId(),
      createdAt: Timestamp.fromDate(startDate),
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      status: status,
      options: [
        {
          id: `opt-1-${Date.now() + i}`,
          text: "Opção A",
          votes: Math.floor(Math.random() * 10),
        },
        {
          id: `opt-2-${Date.now() + i}`,
          text: "Opção B",
          votes: Math.floor(Math.random() * 10),
        },
        {
          id: `opt-3-${Date.now() + i}`,
          text: "Opção C",
          votes: Math.floor(Math.random() * 10),
        },
      ],
    };

    batch.set(pollRef, pollData);
  }

  // 2. Criar 100 votos atribuídos aleatoriamente aos usuários-alvo
  for (let i = 0; i < 100; i++) {
    const pollId = pollIds[i];
    const userId = getRandomTargetUserId();
    const voteRef = doc(db, "userVotes", `${pollId}_${userId}`);
    const votedAt = new Date(Date.now() - i * 3600000 * 4); // Intervalo de horas

    batch.set(voteRef, {
      pollId: pollId,
      userId,
      optionId: `opt-1-${Date.now() + i}`,
      votedAt: Timestamp.fromDate(votedAt),
    });
  }

  await batch.commit();
  console.log(
    "✅ Banco de dados populado com sucesso! (15 Enquetes e 100 Votos criados)",
  );
}

seedDatabase().catch(console.error);
