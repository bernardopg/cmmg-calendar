# Manual do Projeto

Este é o manual central do CMMG Calendar. Ele explica o produto, os fluxos de
uso, arquitetura, os comandos e os pontos de operação que precisam estar
corretos para desenvolver, manter ou integrar a aplicação.

## Resumo Executivo

O CMMG Calendar converte dados do quadro de horários acadêmico do Portal do
Aluno CMMG em formatos de calendário. O usuário pode autenticar no TOTVS, usar
um cookie de sessão ou enviar manualmente o arquivo `QuadroHorarioAluno.json`.
O sistema entrega:

- análise do semestre com totais, disciplinas, horários, locais, dias da semana
  e distribuição mensal;
- `GoogleAgenda.csv` para Google Calendar;
- `ThunderbirdAgenda.ics` para Thunderbird, Outlook, Apple Calendar e clientes
  iCalendar;
- API HTTP (PHP) para os fluxos que precisam do servidor.

Toda a análise e a exportação rodam no navegador. O servidor só entra onde é
inevitável: o salto autenticado ao TOTVS, porque o portal não envia cabeçalhos
de CORS.

## Estado Atual do Projeto

| Área | Estado canônico |
| --- | --- |
| Frontend | `react-app/`, React 19, Vite 8, TypeScript 6 |
| Backend | `deploy/api/`, três endpoints PHP 8.3 na Hostinger |
| Deploy principal | `scalpel/deploy/deploy.sh` (rsync/SSH) → `calendar.scalpel.com.br` |
| Testes | Node Test Runner em `react-app/src/lib` (`npm test`) |
| CI | GitHub Actions em Node 24, job `frontend` (lint + tsc + test + build) |
| Migração legada | Backend Node/Fastify removido em setembro/2026; antes disso, Flask/Python |

O app faz parte do hub **Scalpel** (`scalpel.com.br`) e mora em
`scalpel/apps/calendar`. Restrições da hospedagem compartilhada e fluxo de
publicação estão em [`CLAUDE.md`](CLAUDE.md) e
[`docs/guides/DEPLOY_HOSTINGER.md`](docs/guides/DEPLOY_HOSTINGER.md).

## Como o Produto Funciona

### Fluxo 1: Login TOTVS

1. Usuário informa usuário e senha do Portal do Aluno.
2. Frontend chama `POST /api/totvs-login.php`.
3. PHP autentica no TOTVS (cookies em memória, redirect manual), seleciona o
   contexto acadêmico, baixa o `QuadroHorarioAluno` e devolve o JSON.
4. A análise das estatísticas e a exportação de CSV e ICS acontecem no
   navegador.

### Fluxo 2: Cookie TOTVS

Mesmo fluxo, mas o usuário cola um cookie de sessão que já tem: o frontend
envia `POST /api/extract-analyze.php` com o cookie e o PHP faz a consulta.

### Fluxo 3: Arquivo JSON

O usuário envia o `QuadroHorarioAluno.json` que já tem em mãos. Nada sai do
browser: `analyzeScheduleDataJson` (em `react-app/src/lib/analyzeSchedule.ts`)
interpreta o `data.SHorarioAluno` e monta as estatísticas localmente.

## Arquitetura

```text
Browser (React/Vite SPA)
  |
  |  análise, estatísticas, export CSV/ICS  -> tudo aqui dentro
  |
  | fetch('/api/*.php')  só p/ TOTVS (sem CORS no portal)
  v
PHP 8.3 (LiteSpeed, Hostinger)          TOTVS Portal Educacional
  deploy/api/{_lib,totvs-login,          (login multi-etapa,
  extract-analyze,health}.php             QuadroHorarioAluno)
```

Componentes principais:

- `react-app/src/pages/HomePage.tsx`: tela do gerador e fluxos de login,
  cookie e upload.
- `react-app/src/lib/analyzeSchedule.ts`: análise pura, testada com
  `node --test`.
- `react-app/src/hooks/useScheduleAnalysis.ts`: orquestra os três fluxos.
- `react-app/src/utils/exportUtils.ts`: geração de CSV e ICS no cliente.
- `deploy/api/_lib.php`: cliente TOTVS em PHP (porte de `totvsClient.ts` +
  `totvsParsers.ts`), rate limit, helpers de resposta.
- `deploy/.htaccess`: SPA fallback e bloqueio de `_lib.php`.

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

URL local: `http://localhost:5173`. O proxy `/api` do Vite aponta para
produção (`https://calendar.scalpel.com.br`), já que não há backend local;
sobrescreva com `VITE_API_PROXY_TARGET`.

Passo a passo completo em [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Vite em modo de desenvolvimento. |
| `npm run lint` | Lint do frontend. |
| `npm run test` | Testes das funções puras (`node --test`). |
| `npm run build` | `tsc --noEmit` + build de produção. |
| `npm run check` | Lint + testes + build. |

Não existe CLI local nem `server/`: o backend Node foi removido.

## Variáveis de Ambiente

Todas do frontend, todas opcionais, nenhuma com segredo:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_PORT` | `5173` | Porta do Vite. |
| `VITE_HOST` | `localhost` | Host do Vite. |
| `VITE_API_PROXY_TARGET` | `https://calendar.scalpel.com.br` | Destino do proxy `/api` no dev. |

As constantes do TOTVS (URLs do portal, timeout, User-Agent) ficam no topo de
`deploy/api/_lib.php`.

## API

Base de produção: `https://calendar.scalpel.com.br/api`

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/health.php` | Status da API. |
| `POST` | `/api/totvs-login.php` | Login TOTVS com usuário/senha, consulta horário e devolve o JSON. |
| `POST` | `/api/extract-analyze.php` | Consulta TOTVS por cookie e devolve o JSON. |

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
- Campos principais: assunto, data/hora inicial, data/hora final, descrição,
  local e privacidade.
- Uso principal: importação no Google Calendar.

### ICS

- Nome padrão: `ThunderbirdAgenda.ics`
- Formato: `VCALENDAR` com múltiplos `VEVENT`.
- Inclui `UID`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`,
  `LOCATION`, `STATUS` e `TRANSP`.
- Uso principal: Thunderbird, Outlook, Apple Calendar e clientes iCalendar.

## Segurança e Privacidade

- A aplicação não grava credenciais TOTVS em banco de dados — não há banco.
- Senhas e cookies são usados apenas durante a requisição e nunca são
  persistidos (nem em log, nem em sessão, nem em disco).
- Cookie recebido do cliente é validado contra injeção de cabeçalho (`\r`,
  `\n`).
- Endpoints de login e extração têm rate limit por IP (arquivo em `tmp`,
  5 requisições por minuto).
- `_lib.php` não é acessível diretamente (403 pelo `.htaccess`).

## Deploy

O deploy é feito a partir do repositório do hub Scalpel, via rsync/SSH:

```bash
cd scalpel/          # repo do hub
./deploy/deploy.sh calendar
```

O script builda o `react-app`, publica o `dist/` no docroot do subdomínio e
aplica `deploy/` (API PHP + `.htaccess`) por cima. Detalhes e validação
pós-publicação: [docs/guides/DEPLOY_HOSTINGER.md](docs/guides/DEPLOY_HOSTINGER.md).

## Qualidade e CI

Antes de abrir PR:

```bash
npm run check
```

O CI executa lint, `tsc --noEmit`, testes e build do frontend em Node 24.

## Solução de Problemas

Consulte
[docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md) para erros de
instalação, porta, proxy, upload, TOTVS, importação e build.

## Mapa da Documentação

- [README.md](README.md): visão geral e início rápido.
- [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md): navegação central.
- [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md): setup local.
- [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md): uso da interface.
- [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md): contratos HTTP.
- [docs/guides/ARCHITECTURE.md](docs/guides/ARCHITECTURE.md): arquitetura técnica.
- [docs/guides/DEPLOY_HOSTINGER.md](docs/guides/DEPLOY_HOSTINGER.md): deploy e hospedagem.
- [docs/guides/GOOGLE_CALENDAR.md](docs/guides/GOOGLE_CALENDAR.md): importação no Google.
- [docs/guides/THUNDERBIRD.md](docs/guides/THUNDERBIRD.md): importação por ICS.
