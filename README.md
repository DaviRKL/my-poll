# 📊 My Poll — Plataforma de Enquetes em Tempo Real

> Projeto desenvolvido para o **Desafio 002 | Code Challenges - Experiência prática para desenvolvedores**.

O **My Poll** é uma aplicação web moderna e responsiva de enquetes em tempo real. O sistema permite que qualquer usuário crie perguntas com múltiplas opções, defina períodos de vigência, acompanhe a votação em tempo real sem recarregar a página e filtre visualizações personalizadas.

🔗 **Link do Deploy (Firebase Hosting):** [https://my-poll-b9694.web.app/](https://my-poll-b9694.web.app/)  
🎨 **Protótipo no Figma:** [Desafio 002 - Figma Design](https://www.figma.com/design/02RECDrbSUZYJZnhf6Mgvy/Desafio-002---React---Code-Challenges?node-id=2-17&t=51nz3Vz6SaXU2jNk-1)

---

## 🛠️ Tech Stack & Tecnologias

- **Core:** [React 18+](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (com suporte nativo ao Dark Mode)
- **Roteamento:** [TanStack Router](https://tanstack.com/router) (Roteamento baseado em arquivos e gerenciamento de Search Params na URL)
- **Backend & Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) (banco de dados noSQL em tempo real)
- **Autenticação:** [Firebase Auth](https://firebase.google.com/docs/auth) (Login com Google e Autenticação Anônima)
- **Hospedagem:** [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **Internacionalização:** [react-i18next](https://react.i18next.com/) com `i18next-browser-languagedetector` (`pt-BR` e `en-US`)
- **Documentação de UI:** [Storybook](https://storybook.js.org/)
- **Testes Unitários e de Integração:** [Jest](https://jestjs.io/) e [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## ✨ Funcionalidades e Regras de Negócio

### 🚀 Funcionalidades Principais
- **Criar Enquete:** Título, datas de início/término e suporte a **múltiplas opções** (mínimo de 3).
- **Votação em Tempo Real:** Atualização instantânea dos votos e percentuais sem necessidade de recarregar a página (`onSnapshot` do Firestore).
- **Filtros e Escopos Unificados (`/`):**
  - **Todas:** Visualização geral das enquetes da comunidade.
  - **Criadas por mim (`scope=mine`):** Lista filtrada das enquetes criadas pelo usuário logado.
  - **Votadas por mim (`scope=voted`):** Histórico de enquetes nas quais o usuário participou.
- **Busca & Ordenação:**
  - Campo de busca por título da enquete.
  - Ordenação por data de criação (`createdAt`) ou data do voto (`votedAt`).
  - Filtro por status (`não iniciado`, `iniciado`, `em andamento`, `finalizado`).
- **Paginação:** Exibição limite de **10 enquetes por página**.
- **Controle pelo Criador:** Apenas o usuário que criou a enquete tem permissão para alterar o status manualmente na página de detalhes.
- **Tema Claro/Escuro:** Alternância de tema seguindo fielmente as cores e escala neutra do Figma.
- **Internacionalização (i18n):** Suporte completo para Português (pt-BR) e Inglês (en-US), detectando automaticamente o idioma preferido do navegador.

### 📐 Regras de Negócio (RN)
1. **RN1:** Toda enquete deve conter obrigatoriamente um título.
2. **RN2 & RN3:** Toda enquete possui uma data/hora de início e de término.
3. **RN4:** Ciclo de vida com 4 status: `não iniciado` | `iniciado` | `em andamento` | `finalizado`.
4. **RN5:** A enquete deve possuir no mínimo 3 opções de resposta.
5. **RN6:** Se a enquete não estiver ativa, as opções e o botão de votar ficam desabilitados.
6. **Transições Automáticas de Status:**
   - No primeiro voto registrado, o status é alterado de `iniciado` para `em andamento`.
   - Quando a data atual ultrapassa o `endDate`, o status é atualizado de forma transparente no Firestore para `finalizado` (*Lazy Update*).

---

## 📸 Estrutura do Projeto

```text
my-poll/
├── .github/              # Actions / Workflows
├── .storybook/           # Configurações do Storybook
├── scripts/              # Scripts de povoamento (seed) e correção de banco
├── src/
│   ├── assets/           # Imagens e vetores
│   ├── components/       # Componentes de UI (Button, Input, Card, PollCard, etc.)
│   │   └── ui/           # Átomos reutilizáveis
│   ├── config/           # Instâncias de terceiros (firebase.ts, i18n.ts)
│   ├── hooks/            # Custom hooks (useAuth, usePolls, usePoll, usePagination)
│   ├── locales/          # Dicionários de tradução (pt.ts, en.ts)
│   ├── routes/           # Rotas do TanStack Router (__root.tsx, index.tsx, create.tsx, poll.$pollId.tsx)
│   ├── services/         # Camada de comunicação pura com Firestore (pollService.ts)
│   ├── types/            # Definições de tipos TypeScript
│   ├── main.tsx          # Ponto de entrada e RouterProvider
│   └── setupTests.ts     # Configuração global de mocks para o Jest
├── firebase.json         # Configuração do Firebase Hosting SPA
├── jest.config.cjs       # Configuração do Jest com ts-jest e jsdom
└── vite.config.ts        # Configuração do Vite + TanStack Router Plugin
```

---

## ⚡ Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**

### 1. Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/seu-usuario/my-poll.git
cd my-poll
npm install
```

### 2. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto contendo as credenciais do seu Firebase:

```env
VITE_FIREBASE_API_KEY="sua_api_key"
VITE_FIREBASE_AUTH_DOMAIN="seu_auth_domain"
VITE_FIREBASE_PROJECT_ID="seu_project_id"
VITE_FIREBASE_STORAGE_BUCKET="seu_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu_messaging_sender_id"
VITE_FIREBASE_APP_ID="seu_app_id"
```

### 3. Rodar a aplicação em modo de desenvolvimento

```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

---

## 🧪 Testes, Documentação e Scripts

### Executar a suíte de testes (Jest + RTL)
```bash
npm test
```

### Executar os testes em modo Watch
```bash
npm run test:watch
```

### Iniciar o Storybook
```bash
npm run storybook
```

### Popular o banco de dados local com dados de teste (Seed)
```bash
npm run seed
```

---

## 🚀 Deploy

Para gerar o build de produção e enviar as alterações para o **Firebase Hosting**:

```bash
# Executa a verificação de tipos, build otimizado e deploy no Firebase
npm run deploy
```
