# Arquitetura

Este guia descreve a arquitetura atual do CMMG Calendar para manutenção técnica.

## Visão Geral

```text
Usuário
  |
  v
React SPA (react-app)
  |
  | /api/analyze
  | /api/extract-analyze
  | /api/totvs-login
  v
Fastify API (server)
  |
  | quando necessário
  v
Portal TOTVS Educacional
```

Em desenvolvimento, o Vite serve a SPA e faz proxy de `/api` para o Fastify. Em produção, o Fastify serve a API e os arquivos de `react-app/dist` no mesmo processo.

## Diretórios

```text
react-app/
  src/
    components/      # layout, UI, gráficos, resultados e upload
    hooks/           # estado da API, tema, upload e análise
    pages/           # rotas da SPA
    types/           # tipos usados no frontend
    utils/           # exportação e utilitários

server/
  src/
    cli/             # comandos locais
    routes/          # plugins Fastify por endpoint
    services/        # regras de negócio e integração TOTVS
    config.ts        # ambiente e paths
    index.ts         # composição e bootstrap do servidor
    types.ts         # contratos internos
```

## Frontend

Rotas principais:

| Rota | Componente | Descrição |
| --- | --- | --- |
| `/` | `LandingPage` | Página inicial. |
| `/gerador` | `HomePage` | Fluxos de login, cookie, upload, análise e exportação. |
| `/guia` | `GuidePage` | Ajuda dentro da aplicação. |
| `/faq` | `FaqPage` | Perguntas frequentes. |
| `/sobre` | `AboutPage` | Contexto do projeto. |

Hooks importantes:

- `useApiHealth`: monitora `/api/health`.
- `useFileUpload`: valida arquivo `.json` e formato mínimo `data.SHorarioAluno`.
- `useScheduleAnalysis`: gerencia chamadas da API e cancela requisições antigas com `AbortController`.
- `useToast`: feedback visual e limpeza de timers.

Exportação web:

- `exportToCSV`: gera `GoogleAgenda.csv`.
- `exportToICS`: gera `ThunderbirdAgenda.ics`.
- IDs são gerados com utilitário seguro, evitando fallback com `Math.random`.

## Backend

`server/src/index.ts` monta o Fastify com:

- logger com campos sensíveis redigidos;
- headers básicos de segurança;
- CORS seguro por padrão;
- rate limit por rota;
- upload multipart com limite de tamanho;
- arquivos estáticos do frontend quando `react-app/dist` existe;
- handlers padronizados de erro e not found.

Rotas:

| Rota | Arquivo | Responsabilidade |
| --- | --- | --- |
| `GET /api/health` | `routes/health.ts` | Status da API. |
| `POST /api/analyze` | `routes/analyze.ts` | Analisa upload JSON. |
| `POST /api/extract-analyze` | `routes/extractAnalyze.ts` | Busca no TOTVS por cookie. |
| `POST /api/totvs-login` | `routes/totvsLogin.ts` | Login TOTVS e extração. |

Serviços:

- `analyzeSchedule.ts`: transforma entries em estatísticas.
- `scheduleEntries.ts`: extrai e valida `data.SHorarioAluno`.
- `totvsClient.ts`: login, contexto, cookie jar e fetch do TOTVS.
- `totvsParsers.ts`: parsing de erros, formulários e contexto TOTVS.
- `exportSchedule.ts`: CSV/ICS para CLI.

## TOTVS

O backend usa `TOTVS_BASE_URL` e monta endpoints padrão para CMMG. Quando necessário, cada endpoint pode ser sobrescrito por variável específica.

Fluxo de login:

1. Buscar formulário de login.
2. Enviar credenciais.
3. Executar auto-login.
4. Buscar contextos acadêmicos.
5. Selecionar contexto por alias ou default.
6. Consultar `QuadroHorarioAluno`.
7. Validar payload e analisar.

## Build e Produção

`npm run build` gera:

- `react-app/dist`
- `server/dist`

O Dockerfile tem dois estágios:

| Estágio | Função |
| --- | --- |
| `builder` | instala dependências completas e compila frontend/backend |
| `runner` | instala dependências de produção do servidor e roda `node server/dist/index.js` |

O contêiner roda como usuário `node`, expõe `8080` e usa `HOST=0.0.0.0`.

## CI

O workflow principal usa Node 24.

Job `backend`:

- instala dependências da raiz e do servidor;
- executa testes;
- compila TypeScript.

Job `frontend`:

- instala dependências do frontend;
- executa lint;
- executa `tsc --noEmit`;
- executa build Vite.

## Decisões Relevantes

- Backend canônico é Node/Fastify; não há backend Python ativo.
- Exportação da interface é client-side para evitar endpoints extras e manter download imediato.
- CLI mantém exportação server-side para automação local.
- CORS em produção é fechado por padrão.
- Caminhos das CLIs são restritos à raiz do projeto para evitar path traversal.

## Relacionados

- [Manual do Projeto](../../DOCUMENTACAO.md)
- [Referência da API](API_REFERENCE.md)
- [CLI](CLI.md)
