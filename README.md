# 🛡️ SecBot-X — InfoSec AI Assistant

## Projeto de IA da disciplina ENGENHARIA DE INTELIGÊNCIA ARTIFICIAL

Chat de IA especializado em Segurança da Informação com Next.js 14, Turso e OpenRouter.

## Setup rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar `.env.local`

```env
TURSO_DATABASE_URL=seu_database_aqui
TURSO_AUTH_TOKEN=seu_token_aqui
OPENROUTER_API_KEY=sua_chave_aqui
```

**Chave OpenRouter:** https://openrouter.ai → Keys → New Key

### 3. Rodar

```bash
npm run dev   # desenvolvimento
npm run build && npm start  # produção
```

## Stack

- **Next.js 14** App Router + TypeScript
- **Turso** (libSQL/SQLite) para histórico de conversas
- **OpenRouter** (llama-4-maverick) com roleprompt + metaprompt de infosec
- **UI** estilo terminal hacker com streaming SSE

## Estrutura

```
app/
├── api/
│   ├── chat/route.ts                    # Streaming SSE → OpenRouter
│   └── conversations/
│       ├── route.ts                     # CRUD conversas
│       └── [id]/messages/route.ts       # Histórico
├── components/
│   ├── Sidebar.tsx                      # Lista de sessões
│   ├── ChatArea.tsx                     # Área de mensagens
│   ├── ChatInput.tsx                    # Input + quick prompts
│   └── MessageBubble.tsx               # Markdown renderer
lib/
├── db.ts       # Cliente Turso + schema
├── prompt.ts   # ROLEPROMPT + METAPROMPT SecBot-X
└── types.ts    # Interfaces
```
