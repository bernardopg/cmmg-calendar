# CMMG Calendar

> Converta seu quadro de horários do Portal do Aluno CMMG em calendário digital — Google Calendar, Thunderbird, Outlook ou qualquer app iCalendar.

[![Deploy](https://img.shields.io/badge/deploy-DigitalOcean-0080ff?logo=digitalocean&logoColor=white)](https://calendar.scalpel.com.br)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Fcalendar.scalpel.com.br&label=status&up_message=online)](https://calendar.scalpel.com.br)
[![Node](https://img.shields.io/badge/node-%5E20.19%20%7C%7C%20%3E%3D22.12-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**🌐 Acesse em produção: [calendar.scalpel.com.br](https://calendar.scalpel.com.br)**

---

## O que faz

O portal TOTVS exporta o horário acadêmico como `QuadroHorarioAluno.json`. Esta ferramenta lê esse arquivo — ou busca diretamente via login — e gera:

- **`GoogleAgenda.csv`** — importação direta no Google Calendar
- **`Agenda.ics`** — compatível com Thunderbird, Outlook, Apple Calendar e qualquer cliente iCalendar

Além disso, exibe estatísticas do semestre: disciplinas, professores, salas, distribuição por dia e mês.

---

## Três formas de usar

### 1. Login automático _(recomendado)_
Informe usuário e senha do Portal do Aluno. O servidor autentica no TOTVS, extrai o horário e retorna os dados — sem armazenar credenciais.

### 2. Cookie manual _(avançado)_
Cole o header `Cookie` de uma sessão ativa (`ASP.NET_SessionId` + `.ASPXAUTH`). Útil quando o login automático não estiver disponível.

### 3. Upload do arquivo
Baixe o `QuadroHorarioAluno.json` manualmente pelo portal e faça upload. Sem necessidade de login.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js · Fastify · TypeScript |
| Frontend | React · Vite · TypeScript · CSS próprio |
| Deploy | DigitalOcean App Platform · Docker multi-stage |
| Testes | Node Test Runner nativo |

---

## Desenvolvimento local

### Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+

### Subir tudo de uma vez

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install   # instala root + react-app + server
npm run dev   # backend (5000) + frontend Vite (5173) em paralelo
```

| Serviço | URL |
|---------|-----|
| Frontend (Vite dev server) | http://localhost:5173 |
| API | http://localhost:5000/api/health |

O Vite faz proxy de `/api/*` para o Fastify local — sem CORS e sem alterar nada no código.

### Processos separados

```bash
npm run dev:server   # apenas o Fastify (watch mode)
npm run dev:client   # apenas o Vite
```

### Variáveis de ambiente

Crie `.env` na raiz (opcional — os valores abaixo já são o padrão):

```env
PORT=5000
HOST=0.0.0.0
MAX_FILE_SIZE_MB=10
TOTVS_TIMEOUT_MS=30000
TOTVS_DEFAULT_ALIAS=CorporeRM
```

As URLs do TOTVS (`TOTVS_QUADRO_URL`, `TOTVS_LOGIN_URL`, etc.) têm valores padrão apontando para o portal da CMMG. Só precise sobrescrever se sua instituição usar uma URL diferente.

---

## CLI

Para uso fora da interface web:

```bash
# Exportar CSV e ICS a partir de um arquivo local
npm run schedule:export -- --input data/QuadroHorarioAluno.json

# Apenas analisar (sem exportar)
npm run schedule:analyze -- --input data/QuadroHorarioAluno.json

# Buscar via cookie de sessão
npm run totvs:fetch -- --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

Saída gerada em `output/`.

---

## API

```
GET  /api/health           → status do servidor
POST /api/analyze          → analisa JSON enviado por upload (multipart)
POST /api/extract-analyze  → extrai e analisa via cookie TOTVS
POST /api/totvs-login      → autentica e extrai via usuário/senha
```

Exemplo rápido:

```bash
curl -X POST \
  -F "file=@QuadroHorarioAluno.json" \
  https://calendar.scalpel.com.br/api/analyze
```

---

## Estrutura do projeto

```
cmmg-calendar/
├── server/          # Fastify + TypeScript (backend)
│   └── src/
│       ├── routes/  # endpoints da API
│       └── services/# lógica TOTVS e análise
├── react-app/       # React + Vite (frontend)
│   └── src/
│       ├── pages/
│       └── components/
├── Dockerfile       # build multi-stage para produção
├── .do/app.yaml     # spec do DigitalOcean App Platform
└── docs/            # guias detalhados
```

---

## Deploy

O projeto usa um **Dockerfile multi-stage** para produção:

1. **Stage build** — instala todas as dependências e compila React + TypeScript
2. **Stage runner** — copia apenas os artefatos compilados e as dependências de produção

```bash
# Build local da imagem
docker build -t cmmg-calendar .
docker run -p 8080:8080 -e NODE_ENV=production cmmg-calendar
docker run -p 8080:8080 -e NODE_ENV=production -e PORT=8080 cmmg-calendar
```

No DigitalOcean App Platform, o deploy é automático a cada push para `main`.

---

## Documentação

- [Documentação completa](DOCUMENTACAO.md)
- [Instalação detalhada](docs/guides/INSTALLATION.md)
- [Interface web](docs/guides/WEB_INTERFACE.md)
- [Referência da API](docs/guides/API_REFERENCE.md)
- [Google Calendar](docs/guides/GOOGLE_CALENDAR.md)
- [Thunderbird / iCalendar](docs/guides/THUNDERBIRD.md)

---

## Contribuição

Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

## Segurança

Consulte [SECURITY.md](SECURITY.md).

## Licença

MIT — consulte [LICENSE](LICENSE).

---

**Autor:** Bernardo Gomes · [bebitterbebetter.com.br](https://bebitterbebetter.com.br) · [@be.pgomes](https://instagram.com/be.pgomes) · [github.com/bernardopg](https://github.com/bernardopg)
