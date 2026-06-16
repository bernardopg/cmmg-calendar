# Instalação e Ambiente Local

Este guia cobre o ambiente local do CMMG Calendar: instalação, execução, build, variáveis de ambiente e validação básica.

## Requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js | `^22.12.0` ou `>=24.0.0` |
| npm | `>=10` |
| Git | qualquer versão recente |

Valide antes de instalar:

```bash
node -v
npm -v
```

## Instalação

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
```

O `postinstall` da raiz executa `npm install` em `react-app/` e `server/`. Se precisar reinstalar manualmente:

```bash
npm run install:all
```

## Desenvolvimento Full Stack

```bash
npm run dev
```

Esse comando sobe dois processos em paralelo:

| Processo | Comando interno | URL padrão |
| --- | --- | --- |
| Backend | `npm run dev --prefix server` | `http://localhost:5000` |
| Frontend | `npm run dev --prefix react-app` | `http://localhost:5173` |

Teste a API:

```bash
curl http://localhost:5000/api/health
```

Resposta esperada:

```json
{
  "status": "up",
  "message": "API funcionando",
  "port": 5000,
  "timestamp": "2026-06-16T14:32:28.691Z"
}
```

## Processos Separados

Use dois terminais quando quiser depurar um lado sem reiniciar o outro.

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

## Proxy do Frontend

Em desenvolvimento, o frontend chama `/api/...`. O Vite encaminha essas chamadas para:

```text
VITE_API_PROXY_TARGET
ou http://127.0.0.1:${SERVER_PORT || API_PORT || PORT || 5000}
```

Configurações úteis:

```bash
VITE_PORT=5173 npm run dev:client
SERVER_PORT=5001 npm run dev:client
VITE_API_PROXY_TARGET=http://127.0.0.1:5001 npm run dev:client
```

## Build Local

```bash
npm run build
```

Saídas geradas:

- `react-app/dist/`
- `server/dist/`

Para executar o app compilado:

```bash
npm start
```

Nesse modo, o Fastify serve a API e a SPA compilada no mesmo processo.

## Verificações de Qualidade

```bash
npm run lint
npm run test
npm run build
```

Ou tudo de uma vez:

```bash
npm run check
```

## Variáveis de Ambiente

O backend carrega `.env` na raiz e depois `server/.env`. Valores em `server/.env` têm prioridade.

Exemplo de `.env`:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5000
MAX_FILE_SIZE_MB=10
TOTVS_TIMEOUT_MS=30000
TOTVS_BASE_URL=https://fundacaoeducacional132827.rm.cloudtotvs.com.br
TOTVS_DEFAULT_ALIAS=CorporeRM
```

Variáveis TOTVS opcionais:

```env
TOTVS_COOKIE=
TOTVS_QUADRO_URL=
TOTVS_PORTAL_REFERER=
TOTVS_LOGIN_URL=
TOTVS_AUTO_LOGIN_URL=
TOTVS_CONTEXT_URL=
TOTVS_CONTEXT_SELECTION_URL=
```

Se essas URLs ficarem vazias, o backend usa os padrões derivados de `TOTVS_BASE_URL`.

Variáveis de CORS:

```env
CORS_ORIGINS=https://calendar.scalpel.com.br,https://outro-dominio.exemplo
```

Comportamento:

- Em desenvolvimento sem `CORS_ORIGINS`, o backend reflete a origem para facilitar o uso com Vite.
- Em produção sem `CORS_ORIGINS`, CORS cross-origin não é habilitado.

## Docker

Build local:

```bash
docker build -t cmmg-calendar .
```

Execução:

```bash
docker run -p 8080:8080 -e NODE_ENV=production cmmg-calendar
```

Com variáveis extras:

```bash
docker run \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e CORS_ORIGINS=https://calendar.scalpel.com.br \
  cmmg-calendar
```

## Deploy DigitalOcean

O arquivo `.do/app.yaml` define:

- serviço `web`;
- branch `main`;
- `deploy_on_push: true`;
- build via `Dockerfile`;
- porta HTTP `8080`;
- variáveis de runtime básicas.

## Próximos Passos

- [Interface Web](WEB_INTERFACE.md)
- [Referência da API](API_REFERENCE.md)
- [CLI](CLI.md)
- [Solução de Problemas](TROUBLESHOOTING.md)
