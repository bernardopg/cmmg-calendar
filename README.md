# CMMG Calendar

> Transforme o quadro de horários do Portal do Aluno CMMG em arquivos prontos para Google Calendar, Thunderbird, Outlook, Apple Calendar e outros apps compatíveis com iCalendar.

[![Produção](https://img.shields.io/website?url=https%3A%2F%2Fcalendar.scalpel.com.br&label=calendar.scalpel.com.br)](https://calendar.scalpel.com.br)
[![Node](https://img.shields.io/badge/node-%5E22.12%20%7C%7C%20%3E%3D24-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Acesse em produção:** <https://calendar.scalpel.com.br>

## Para Que Serve

O CMMG Calendar reduz o trabalho manual de cadastrar aulas uma por uma em um
calendário. Ele lê os dados do `QuadroHorarioAluno` do TOTVS, valida a
estrutura, calcula estatísticas do semestre e gera arquivos de calendário.

Você pode usar de três formas:

| Fluxo | Quando usar | O que acontece |
| --- | --- | --- |
| Login TOTVS | Fluxo mais simples para estudantes | A API PHP autentica no Portal do Aluno e devolve o horário. A senha não é armazenada. |
| Cookie TOTVS | Alternativa quando o login automático falhar | Você cola um cookie de sessão ativo e a API consulta o horário. |
| Upload JSON | Quando você já tem o arquivo local | O arquivo é lido e analisado no próprio navegador, sem subir para lugar nenhum. |

Arquivos gerados:

- `GoogleAgenda.csv`: importação pelo Google Calendar.
- `ThunderbirdAgenda.ics`: formato universal para Thunderbird, Outlook, Apple Calendar e outros clientes.

## Como Funciona

Quase tudo roda no seu navegador. O servidor só existe para um detalhe: o
portal do TOTVS não envia cabeçalhos CORS, então o navegador não consegue falar
com ele diretamente. Três arquivos PHP fazem esse salto e devolvem o JSON cru.

```text
Navegador                              Servidor            TOTVS
─────────                              ────────            ─────
upload de arquivo ──► análise local
login/cookie ─────────────────────────► api/*.php ────────► Portal do Aluno
análise, estatísticas, CSV, ICS ◄────── JSON cru ◄──────────┘
```

## Início Rápido

Pré-requisitos: Node.js `^22.12.0` ou `>=24.0.0`, npm `>=10`, Git.

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
npm run dev            # http://localhost:5173
```

Não existe backend local: o Vite encaminha `/api` para produção. Para apontar
para outro ambiente, use `VITE_API_PROXY_TARGET`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o Vite em `:5173`. |
| `npm run lint` | Executa o ESLint. |
| `npm run test` | Testes da análise (`node --test`, sem runner extra). |
| `npm run build` | `tsc --noEmit` e build do Vite. |
| `npm run check` | Lint, testes e build. |

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 6, CSS próprio |
| Análise e exportação | TypeScript puro rodando no navegador |
| Backend | PHP 8.3 com curl (só o salto autenticado ao TOTVS) |
| Testes | Node Test Runner nativo |
| Produção | Hospedagem compartilhada Hostinger, publicada por rsync |
| CI | GitHub Actions: lint, typecheck, testes e build |

## Estrutura

```text
cmmg-calendar/
├── react-app/                  # SPA React/Vite
│   └── src/
│       ├── pages/              # rotas /, /gerador, /guia, /faq, /sobre
│       ├── hooks/              # API, upload, tema, análise
│       ├── lib/                # análise do quadro de horários (+ testes)
│       ├── components/         # UI, layout, resultados, gráficos
│       └── utils/              # exportação CSV/ICS
├── deploy/                     # camada de servidor publicada junto do build
│   ├── api/                    # health, totvs-login, extract-analyze
│   └── .htaccess               # fallback de rota da SPA e headers
├── scalpel-app.sh              # manifesto lido pelo deploy do Scalpel
└── docs/                       # documentação técnica e guias de uso
```

## API

Base: `https://calendar.scalpel.com.br/api`

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/health.php` | Verifica disponibilidade. |
| `POST` | `/api/totvs-login.php` | Autentica no TOTVS e busca o horário. |
| `POST` | `/api/extract-analyze.php` | Consulta o TOTVS com um cookie de sessão. |

Não há mais endpoint de upload: o arquivo é analisado no navegador. Contratos
completos em [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md).

## Documentação

1. [Manual completo](DOCUMENTACAO.md)
2. [Índice da documentação](docs/DOCUMENTATION_INDEX.md)
3. [Instalação e ambiente](docs/guides/INSTALLATION.md)
4. [Interface web](docs/guides/WEB_INTERFACE.md)
5. [Referência da API](docs/guides/API_REFERENCE.md)
6. [Arquitetura](docs/guides/ARCHITECTURE.md)
7. [Deploy](docs/guides/DEPLOY_HOSTINGER.md)
8. [Solução de problemas](docs/guides/TROUBLESHOOTING.md)

Guias de importação:

- [Google Calendar](docs/guides/GOOGLE_CALENDAR.md)
- [Thunderbird e iCalendar](docs/guides/THUNDERBIRD.md)

## Segurança e Privacidade

- As credenciais do TOTVS são usadas apenas na requisição de login e não são
  persistidas: nem em log, nem em sessão, nem em disco.
- O arquivo JSON enviado por upload nunca sai do seu navegador.
- Os endpoints têm rate limit por IP.
- O cookie recebido em `extract-analyze.php` é recusado se contiver quebras de
  linha, que poderiam ser usadas para injeção de cabeçalho.

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
