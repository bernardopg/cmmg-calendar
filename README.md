# CMMG Calendar

> Transforme o quadro de horários do Portal do Aluno CMMG em arquivos prontos para Google Calendar, Thunderbird, Outlook, Apple Calendar e outros apps compatíveis com iCalendar.

[![Produção](https://img.shields.io/website?url=https%3A%2F%2Fcalendar.scalpel.com.br&label=calendar.scalpel.com.br)](https://calendar.scalpel.com.br)
[![Node](https://img.shields.io/badge/node-%5E22.12%20%7C%7C%20%3E%3D24-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Acesse em produção:** <https://calendar.scalpel.com.br>

## Para Que Serve

O CMMG Calendar reduz o trabalho manual de cadastrar aulas uma por uma em um calendário. Ele lê os dados do `QuadroHorarioAluno` do TOTVS, valida a estrutura, calcula estatísticas do semestre e gera arquivos de calendário.

Você pode usar de três formas:

| Fluxo | Quando usar | O que acontece |
| --- | --- | --- |
| Login TOTVS | Fluxo mais simples para estudantes | A API autentica no Portal do Aluno, consulta o horário e devolve a análise. A senha não é armazenada. |
| Cookie TOTVS | Alternativa avançada quando o login automático falhar | Você cola um cookie de sessão ativo e a API consulta o horário. |
| Upload JSON | Quando você já tem o arquivo local | Você envia `QuadroHorarioAluno.json` e a API apenas analisa o arquivo. |

Arquivos gerados:

- `GoogleAgenda.csv`: importação pelo Google Calendar.
- `ThunderbirdAgenda.ics`: formato universal para Thunderbird, Outlook, Apple Calendar e outros clientes.

## Início Rápido

Pré-requisitos:

- Node.js `^22.12.0` ou `>=24.0.0`
- npm `>=10`
- Git

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
npm run dev
```

Serviços em desenvolvimento:

| Serviço | URL |
| --- | --- |
| Frontend Vite | `http://localhost:5173` |
| API Fastify | `http://localhost:5000/api/health` |

O frontend usa chamadas relativas (`/api/...`) e o Vite encaminha essas chamadas para o backend local.

## Comandos Principais

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe backend e frontend em watch mode. |
| `npm run dev:server` | Sobe apenas o Fastify em `:5000`. |
| `npm run dev:client` | Sobe apenas o Vite em `:5173`. |
| `npm run lint` | Executa lint do frontend. |
| `npm run test` | Executa testes do backend. |
| `npm run build` | Compila frontend e backend. |
| `npm run check` | Executa lint, testes e build. |
| `npm start` | Inicia o backend compilado, servindo também o build do frontend. |

Utilitários CLI:

```bash
npm run schedule:analyze -- --input data/QuadroHorarioAluno.json
npm run schedule:export -- --input data/QuadroHorarioAluno.json
npm run totvs:fetch -- --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

## Stack Atual

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 6, CSS próprio |
| Backend | Node.js, Fastify 5, TypeScript 6, Zod, Undici |
| Testes | Node Test Runner nativo |
| Produção | Docker multi-stage em Node 24, DigitalOcean App Platform |
| CI | GitHub Actions com Node 24, lint, typecheck, build, testes e CodeQL |

## Arquitetura em Uma Página

```text
cmmg-calendar/
├── react-app/                 # SPA React/Vite
│   └── src/
│       ├── pages/             # rotas /, /gerador, /guia, /faq, /sobre
│       ├── hooks/             # estado de API, upload, tema e análise
│       ├── components/        # UI, layout, resultados, gráficos
│       └── utils/             # exportação CSV/ICS e utilitários
├── server/                    # API Fastify + CLIs Node
│   └── src/
│       ├── routes/            # /api/health, /api/analyze, /api/extract-analyze, /api/totvs-login
│       ├── services/          # análise, TOTVS, parsing e exportação
│       └── cli/               # comandos locais
├── docs/                      # documentação técnica e guias de uso
├── Dockerfile                 # imagem de produção
└── .do/app.yaml               # deploy no DigitalOcean App Platform
```

Em produção, o backend serve a API em `/api/*` e também os arquivos estáticos gerados em `react-app/dist`.

## API Resumida

Base local: `http://localhost:5000/api`

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica disponibilidade da API. |
| `POST` | `/api/analyze` | Analisa um `.json` enviado por `multipart/form-data`. |
| `POST` | `/api/extract-analyze` | Consulta TOTVS usando cookie de sessão. |
| `POST` | `/api/totvs-login` | Autentica no TOTVS com usuário/senha e busca o horário. |

Exemplo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/api/analyze
```

Veja contratos completos em [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md).

## Configuração

A aplicação funciona com valores padrão para o portal CMMG. Sobrescreva apenas se necessário.

```env
PORT=5000
HOST=0.0.0.0
MAX_FILE_SIZE_MB=10
TOTVS_TIMEOUT_MS=30000
TOTVS_BASE_URL=https://fundacaoeducacional132827.rm.cloudtotvs.com.br
TOTVS_DEFAULT_ALIAS=CorporeRM
CORS_ORIGINS=https://calendar.scalpel.com.br
```

Também existem variáveis específicas para endpoints TOTVS, descritas no [guia de instalação](docs/guides/INSTALLATION.md).

## Documentação

Comece pelo caminho abaixo:

1. [Manual completo](DOCUMENTACAO.md)
2. [Índice da documentação](docs/DOCUMENTATION_INDEX.md)
3. [Instalação e ambiente](docs/guides/INSTALLATION.md)
4. [Interface web](docs/guides/WEB_INTERFACE.md)
5. [Referência da API](docs/guides/API_REFERENCE.md)
6. [CLI](docs/guides/CLI.md)
7. [Arquitetura](docs/guides/ARCHITECTURE.md)
8. [Solução de problemas](docs/guides/TROUBLESHOOTING.md)

Guias de importação:

- [Google Calendar](docs/guides/GOOGLE_CALENDAR.md)
- [Thunderbird e iCalendar](docs/guides/THUNDERBIRD.md)

## Segurança e Privacidade

- Credenciais TOTVS são usadas apenas para a requisição de login e não são persistidas pela aplicação.
- Cookies e senhas são mascarados nos logs do backend.
- Uploads têm limite configurável por `MAX_FILE_SIZE_MB`.
- Endpoints sensíveis têm rate limit.
- Em produção, CORS só é liberado para origens explicitamente configuradas em `CORS_ORIGINS`.

Para reportar vulnerabilidades, consulte [SECURITY.md](SECURITY.md).

## Contribuição

Antes de abrir PR:

```bash
npm run check
```

Leia [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo recomendado.

## Licença

MIT. Consulte [LICENSE](LICENSE).

## Créditos

Projeto desenvolvido e mantido por Bernardo Gomes. Veja [CREDITS.md](CREDITS.md).
