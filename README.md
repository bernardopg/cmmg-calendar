# CMMG Calendar Analyzer

Converte o arquivo `QuadroHorarioAluno.json` em calendários utilizáveis e oferece análise estatística por Web, API e CLI.

## Status

- Backend principal em Node.js com Fastify + TypeScript em `server/`
- Frontend React + TypeScript em `react-app/`
- Deploy alvo com um único app Node servindo SPA + `/api/*`
- Stack Python anterior isolado em `legacy/python/`

## Principais Recursos

- Geração de `GoogleAgenda.csv` para importação no Google Calendar
- Geração de `ThunderbirdAgenda.ics` para Thunderbird, Outlook, Apple Calendar e clientes iCalendar
- Análise de registros válidos, inválidos, disciplinas, horários, locais, dias e meses
- Interface web com três fluxos:
  - upload manual do JSON
  - extração automática via login no Portal do Aluno TOTVS
  - extração manual via cookie de sessão TOTVS
- API REST para integração

## Requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+
- Python 3.10+ apenas para o fluxo CLI legado
- Linux, macOS ou Windows

## Início Rápido

### Opção 1: Web em desenvolvimento

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
npm run dev
```

Esse comando sobe backend e frontend juntos em watch.

Se preferir processos separados:

```bash
npm run dev:server
```

```bash
npm run dev:client
```

O fluxo local fica assim:

- Fastify em `http://localhost:5000`
- Vite em `http://localhost:5173`
- frontend chamando sempre `fetch('/api/...')`
- proxy do Vite encaminhando `/api/*` para o Fastify local

Abra:

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000/api/health>

### Variáveis de ambiente locais

Crie `.env` na raiz do projeto quando precisar customizar portas, limites ou URLs do TOTVS:

```bash
PORT=5000
HOST=0.0.0.0
MAX_FILE_SIZE_MB=10
TOTVS_TIMEOUT_MS=30000
TOTVS_COOKIE=
TOTVS_DEFAULT_ALIAS=CorporeRM
TOTVS_QUADRO_URL=
TOTVS_PORTAL_REFERER=
TOTVS_LOGIN_URL=
TOTVS_AUTO_LOGIN_URL=
TOTVS_CONTEXT_URL=
TOTVS_CONTEXT_SELECTION_URL=
```

O backend também aceita `server/.env` para sobrescrever apenas valores do servidor.

### Opção 2: CLI

```bash
cd legacy/python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Saída:

- `output/GoogleAgenda.csv`
- `output/ThunderbirdAgenda.ics`

## Uso pela Interface

1. Abra `http://localhost:5173`
2. Escolha um fluxo:
   - fazer login no Portal do Aluno;
   - colar um cookie TOTVS manualmente;
   - enviar o arquivo JSON manualmente.
3. Revise as estatísticas
4. Exporte CSV ou ICS

## API

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/extract-analyze`
- `POST /api/totvs-login`

Exemplo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/api/analyze
```

Observação:

- exportação CSV e ICS da interface continua client-side em `react-app/src/utils/exportUtils.ts`
- os endpoints Flask `/export/csv` e `/export/ics` permanecem apenas no stack Python legado

## Estrutura do Projeto

```text
cmmg-calendar/
├── package.json
├── server/
├── legacy/
│   └── python/
├── react-app/
└── docs/
```

Observação:

- `server/` é o backend principal atual.
- `legacy/python/` concentra o stack Flask/CLI antigo para consulta futura.
- o fluxo principal do projeto não depende mais de Python.

## Documentação

- Visão geral: [DOCUMENTACAO.md](DOCUMENTACAO.md)
- Índice de documentação: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- Instalação: [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- Interface web: [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md)
- API: [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md)
- Migração: [docs/guides/MIGRATION_STATUS.md](docs/guides/MIGRATION_STATUS.md)
- Google Calendar: [docs/guides/GOOGLE_CALENDAR.md](docs/guides/GOOGLE_CALENDAR.md)
- Thunderbird: [docs/guides/THUNDERBIRD.md](docs/guides/THUNDERBIRD.md)

## Contribuição

Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

## Segurança

Consulte [SECURITY.md](SECURITY.md).

## Licença

Este projeto está sob licença MIT. Consulte [LICENSE](LICENSE).

## Créditos

Autor e mantenedor:

- Bernardo Gomes
- E-mail: <bernardo.gomes@bebitterbebetter.com.br>
- Site: bebitterbebetter.com.br
- Instagram/X: @be.pgomes
- GitHub: [bernardopg](https://github.com/bernardopg)
