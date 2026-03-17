# Guia de Instalação

Este guia cobre instalação e execução local do CMMG Calendar Analyzer.

## Requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+
- Git

## 1) Clone do projeto

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
```

## 2) Instalação recomendada

```bash
npm install
```

Isso instala dependências do `react-app/` e do `server/`.

## 3) Execução local em dev/watch

Fluxo recomendado:

```bash
npm run dev
```

Esse comando sobe:

- backend Fastify em watch
- frontend Vite em watch

Se preferir abrir em terminais separados:

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

Resultado esperado:

- backend Fastify em `http://localhost:5000`
- frontend Vite em `http://localhost:5173`
- chamadas do browser indo para `/api/*`
- proxy do Vite redirecionando `/api/*` para o Fastify local

## 4) Verificação

Backend:

```bash
curl http://localhost:5000/api/health
```

Retorno esperado:

```json
{"status":"up","message":"API funcionando","port":5000}
```

Frontend:

- abra `http://localhost:5173`

## 5) Build local e start de produção

```bash
npm run build
npm start
```

Esse fluxo sobe um único processo Node servindo:

- `react-app/dist`
- `/api/*`

## 6) Utilitários CLI

Analisar JSON:

```bash
npm run schedule:analyze -- --input data/QuadroHorarioAluno.json
```

Exportar CSV e ICS:

```bash
npm run schedule:export -- --input data/QuadroHorarioAluno.json
```

Buscar JSON no TOTVS via cookie:

```bash
npm run totvs:fetch -- --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

## 7) Variáveis de ambiente opcionais

Crie `.env` na raiz:

```bash
PORT=5000
HOST=0.0.0.0
MAX_FILE_SIZE_MB=10
TOTVS_TIMEOUT_MS=30000
TOTVS_COOKIE=
TOTVS_QUADRO_URL=
TOTVS_PORTAL_REFERER=
TOTVS_LOGIN_URL=
TOTVS_AUTO_LOGIN_URL=
TOTVS_CONTEXT_URL=
TOTVS_CONTEXT_SELECTION_URL=
TOTVS_DEFAULT_ALIAS=CorporeRM
```

Opcionalmente, você pode criar `server/.env` para sobrescrever apenas variáveis do backend.

Para o Vite em desenvolvimento, as portas podem ser ajustadas com:

```bash
VITE_PORT=5173
SERVER_PORT=5000
```

## Problemas comuns

### `npm: command not found`

- instale Node.js + npm e valide com `node -v` e `npm -v`.

### Versão do Node incompatível

- use Node.js `20.19+` ou `22.12+`.

### Porta 5000 ou 5173 já em uso

- ajuste `PORT`, `SERVER_PORT` ou `VITE_PORT` no ambiente antes de iniciar.

### `fetch('/api/...')` retorna erro no frontend

- confirme que `npm run dev:server` está rodando
- confirme que o proxy do Vite aponta para a porta certa
- valide `curl http://localhost:5000/api/health`

## 8) Próximos passos

- UI: [WEB_INTERFACE.md](WEB_INTERFACE.md)
- API: [API_REFERENCE.md](API_REFERENCE.md)
- importação: [GOOGLE_CALENDAR.md](GOOGLE_CALENDAR.md) e [THUNDERBIRD.md](THUNDERBIRD.md)
