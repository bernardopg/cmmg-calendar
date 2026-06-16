# Manual do Projeto

Este é o manual central do CMMG Calendar. Ele explica o produto, os fluxos de uso, a arquitetura, os comandos e os pontos de operação que precisam estar corretos para desenvolver, manter ou integrar a aplicação.

## Resumo Executivo

O CMMG Calendar converte dados do quadro de horários acadêmico do Portal do Aluno CMMG em formatos de calendário. O usuário pode autenticar no TOTVS, usar um cookie de sessão ou enviar manualmente o arquivo `QuadroHorarioAluno.json`.

O sistema entrega:

- análise do semestre com totais, disciplinas, horários, locais, dias da semana e distribuição mensal;
- `GoogleAgenda.csv` para Google Calendar;
- `ThunderbirdAgenda.ics` para Thunderbird, Outlook, Apple Calendar e clientes iCalendar;
- API HTTP para integração;
- CLIs locais para análise, exportação e consulta via cookie.

## Estado Atual do Projeto

| Área | Estado canônico |
| --- | --- |
| Frontend | `react-app/`, React 19, Vite 8, TypeScript 6 |
| Backend | `server/`, Fastify 5, TypeScript 6 |
| Deploy principal | Docker multi-stage com Node 24 no DigitalOcean App Platform |
| Testes | Node Test Runner no backend |
| CI | GitHub Actions em Node 24 com jobs `backend` e `frontend` |
| Migração legada | Migração Flask/Python concluída; backend atual é Node |

## Como o Produto Funciona

### Fluxo 1: Login TOTVS

1. Usuário informa usuário e senha do Portal do Aluno.
2. Frontend chama `POST /api/totvs-login`.
3. Backend autentica no TOTVS, seleciona contexto acadêmico e busca o `QuadroHorarioAluno`.
4. Backend devolve análise e dados brutos.
5. Frontend exibe estatísticas e permite exportar CSV ou ICS no navegador.

Use quando o portal estiver disponível e as credenciais forem válidas.

### Fluxo 2: Cookie TOTVS

1. Usuário cola o header `Cookie` de uma sessão já autenticada.
2. Frontend chama `POST /api/extract-analyze`.
3. Backend consulta diretamente o endpoint `QuadroHorarioAluno` do TOTVS.
4. Backend devolve análise e dados brutos.

Use como alternativa avançada quando o login automático não funcionar.

### Fluxo 3: Upload JSON

1. Usuário envia `QuadroHorarioAluno.json`.
2. Frontend valida o formato mínimo (`data.SHorarioAluno`).
3. Frontend chama `POST /api/analyze` com `multipart/form-data`.
4. Backend valida, analisa e devolve as estatísticas.
5. Frontend exporta os arquivos usando os dados carregados no navegador.

Use quando o usuário já tiver o arquivo local.

## Arquitetura

```text
Browser
  |
  | fetch('/api/...')
  v
React/Vite SPA
  |
  | dev: proxy Vite -> http://127.0.0.1:5000
  | prod: mesmo domínio, Fastify serve SPA + API
  v
Fastify API
  |
  | opcional: login/cookie
  v
TOTVS Portal Educacional
```

Componentes principais:

- `react-app/src/pages/HomePage.tsx`: tela do gerador e fluxos de login, cookie e upload.
- `react-app/src/hooks/useScheduleAnalysis.ts`: chamadas para `/api/analyze`, `/api/extract-analyze` e `/api/totvs-login`.
- `react-app/src/utils/exportUtils.ts`: geração client-side de CSV e ICS.
- `server/src/index.ts`: composição do Fastify, CORS, rate limit, headers, estáticos e rotas.
- `server/src/services/totvsClient.ts`: comunicação com TOTVS.
- `server/src/services/analyzeSchedule.ts`: cálculo das estatísticas.
- `server/src/services/exportSchedule.ts`: exportação usada pela CLI.

Detalhes estão em [docs/guides/ARCHITECTURE.md](docs/guides/ARCHITECTURE.md).

## Instalação Local

Requisitos:

- Node.js `^22.12.0` ou `>=24.0.0`
- npm `>=10`
- Git

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
npm run dev
```

URLs locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/health`

Veja o passo a passo completo em [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento full stack em watch mode. |
| `npm run dev:server` | Apenas backend. |
| `npm run dev:client` | Apenas frontend. |
| `npm run lint` | Lint do frontend. |
| `npm run test` | Testes do backend. |
| `npm run build` | Build de frontend e backend. |
| `npm run check` | Lint, testes e build. |
| `npm start` | Executa `server/dist/index.js`. |

CLIs:

| Comando | Resultado |
| --- | --- |
| `npm run schedule:analyze -- --input data/QuadroHorarioAluno.json` | Imprime análise no terminal. |
| `npm run schedule:export -- --input data/QuadroHorarioAluno.json` | Gera `output/GoogleAgenda.csv` e `output/ThunderbirdAgenda.ics`. |
| `npm run totvs:fetch -- --cookie '...'` | Salva `data/QuadroHorarioAluno.json` consultado no TOTVS. |

Veja [docs/guides/CLI.md](docs/guides/CLI.md).

## Variáveis de Ambiente

As variáveis podem ficar em `.env` na raiz. `server/.env` também é carregado e sobrescreve valores da raiz.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente de execução. |
| `HOST` | `0.0.0.0` | Host do Fastify. |
| `PORT` | `5000` | Porta do backend local ou processo único. |
| `MAX_FILE_SIZE_MB` | `10` | Limite de upload em MB. |
| `TOTVS_TIMEOUT_MS` | `30000` | Timeout das chamadas ao TOTVS. |
| `TOTVS_BASE_URL` | URL TOTVS CMMG | Base para montar endpoints TOTVS. |
| `TOTVS_COOKIE` | vazio | Cookie padrão para fluxos via cookie e CLI. |
| `TOTVS_QUADRO_URL` | derivado de `TOTVS_BASE_URL` | Endpoint do `QuadroHorarioAluno`. |
| `TOTVS_PORTAL_REFERER` | derivado de `TOTVS_BASE_URL` | Referer esperado pelo portal. |
| `TOTVS_LOGIN_URL` | derivado de `TOTVS_BASE_URL` | Tela de login do Portal do Aluno. |
| `TOTVS_AUTO_LOGIN_URL` | derivado de `TOTVS_BASE_URL` | Endpoint de auto-login. |
| `TOTVS_CONTEXT_URL` | derivado de `TOTVS_BASE_URL` | Endpoint de contexto acadêmico. |
| `TOTVS_CONTEXT_SELECTION_URL` | derivado de `TOTVS_BASE_URL` | Endpoint de seleção de contexto. |
| `TOTVS_DEFAULT_ALIAS` | `CorporeRM` | Alias preferido no login TOTVS. |
| `CORS_ORIGINS` | vazio | Lista separada por vírgula para liberar CORS em produção. |
| `VITE_PORT` | `5173` | Porta do Vite. |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:$PORT` | Destino do proxy `/api` no Vite. |

## API

Base local: `http://localhost:5000/api`

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/health` | Status do backend. |
| `POST` | `/api/analyze` | Analisa arquivo JSON enviado por upload. |
| `POST` | `/api/extract-analyze` | Consulta TOTVS por cookie e analisa. |
| `POST` | `/api/totvs-login` | Faz login TOTVS, consulta horário e analisa. |

Resposta de sucesso segue o padrão:

```json
{
  "success": true,
  "data": {}
}
```

Resposta de erro segue o padrão:

```json
{
  "success": false,
  "error": "Mensagem legível"
}
```

Contratos completos: [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md).

## Formato do JSON de Entrada

Estrutura mínima esperada:

```json
{
  "data": {
    "SHorarioAluno": [
      {
        "NOME": "Anatomia",
        "DATAINICIAL": "2026-03-10T00:00:00",
        "DATAFINAL": "2026-03-10T00:00:00",
        "HORAINICIAL": "08:00:00",
        "HORAFINAL": "10:00:00",
        "DIASEMANA": "2",
        "PREDIO": "Campus",
        "BLOCO": "A",
        "SALA": "101",
        "CODTURMA": "MED01",
        "CODSUBTURMA": "A",
        "NOMEREDUZIDO": "ANA",
        "URLAULAONLINE": "https://exemplo.invalid/aula"
      }
    ]
  }
}
```

Campos mínimos para análise válida:

- `NOME`
- `DATAINICIAL`

Campos mínimos para evento ICS:

- `NOME`
- `DATAINICIAL`
- `HORAINICIAL`
- `HORAFINAL`

Campos usados para descrição e localização:

- `PREDIO`, `BLOCO`, `SALA`
- `CODTURMA`, `CODSUBTURMA`, `NOMEREDUZIDO`, `URLAULAONLINE`

## Exportação

### CSV

- Nome padrão: `GoogleAgenda.csv`
- Formato de data: `MM/DD/YYYY`
- Campos principais: assunto, data/hora inicial, data/hora final, descrição, local e privacidade.
- Uso principal: importação no Google Calendar.

### ICS

- Nome padrão: `ThunderbirdAgenda.ics`
- Formato: `VCALENDAR` com múltiplos `VEVENT`.
- Inclui `UID`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`, `LOCATION`, `STATUS` e `TRANSP`.
- Uso principal: Thunderbird, Outlook, Apple Calendar e clientes iCalendar.

## Segurança e Privacidade

- A aplicação não grava credenciais TOTVS em banco de dados.
- Senhas e cookies são usados apenas para consultar o portal durante a requisição.
- Logs do backend redigem `cookie`, `authorization`, `password` e `totvs_cookie`.
- Uploads são limitados por tamanho.
- Rotas com maior custo têm rate limit.
- Em produção, CORS cross-origin é bloqueado por padrão e só é liberado via `CORS_ORIGINS`.

## Deploy

O deploy principal usa `Dockerfile` multi-stage:

1. `builder`: instala dependências e executa `npm run build`.
2. `runner`: instala dependências de produção do servidor, copia `server/dist` e `react-app/dist`, roda como usuário `node` e expõe `PORT=8080`.

Build local da imagem:

```bash
docker build -t cmmg-calendar .
docker run -p 8080:8080 -e NODE_ENV=production cmmg-calendar
```

No DigitalOcean App Platform, `.do/app.yaml` aponta para `main`, usa o Dockerfile e habilita deploy automático por push.

## Qualidade e CI

Antes de abrir PR:

```bash
npm run check
```

O CI executa:

- backend: instalação, testes e build TypeScript;
- frontend: instalação, lint, `tsc --noEmit` e build Vite;
- CodeQL e workflows auxiliares de automação.

## Solução de Problemas

Consulte [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md) para erros de instalação, porta, proxy, upload, TOTVS, importação e build.

## Mapa da Documentação

- [README.md](README.md): visão geral e início rápido.
- [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md): navegação central.
- [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md): setup local.
- [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md): uso da interface.
- [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md): contratos HTTP.
- [docs/guides/CLI.md](docs/guides/CLI.md): comandos locais.
- [docs/guides/ARCHITECTURE.md](docs/guides/ARCHITECTURE.md): arquitetura técnica.
- [docs/guides/GOOGLE_CALENDAR.md](docs/guides/GOOGLE_CALENDAR.md): importação no Google.
- [docs/guides/THUNDERBIRD.md](docs/guides/THUNDERBIRD.md): importação por ICS.
