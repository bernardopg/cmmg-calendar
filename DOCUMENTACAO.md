# Documentação Completa

Guia oficial de uso, execução e integração do CMMG Calendar Analyzer.

## Visão geral

O projeto recebe um `QuadroHorarioAluno.json` e permite:

- analisar a grade acadêmica
- exportar CSV compatível com Google Calendar
- exportar ICS compatível com Thunderbird e outros clientes iCalendar

Formas de uso disponíveis:

- interface web
- API REST
- CLI local

## Arquitetura atual

- `server/` contém o backend atual em Fastify + TypeScript
- o app Node serve o build do `react-app/dist` em produção
- as rotas da API ficam sob `/api/*`
- a exportação usada pela interface web é client-side
- o backend também expõe utilitários CLI em Node para análise, exportação e fetch via cookie
- `react-app/` contém o frontend React + TypeScript

## Requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+

## Instalação

### Desenvolvimento local em watch

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
npm run dev
```

Fluxo:

- Fastify em `http://localhost:5000`
- Vite em `http://localhost:5173`
- proxy do Vite encaminhando `/api/*` para o servidor Fastify
- hot reload no frontend e watch no backend via `tsx`

### Build local do app único

```bash
npm run build
npm start
```

Esse fluxo gera:

- `react-app/dist`
- `server/dist`

## Uso pela interface web

Há três fluxos disponíveis na página principal:

### Login TOTVS

Informe usuário e senha do Portal do Aluno. O backend chama `/totvs-login`, autentica no TOTVS, busca o horário e devolve a análise.

### Cookie manual

Cole um cookie de sessão autenticada. O backend chama `/extract-analyze`.

### Upload manual

Envie o `QuadroHorarioAluno.json` diretamente. O backend chama `/analyze`.

## Uso via CLI

### Gerar CSV e ICS

Pré-requisito:

- arquivo em `data/QuadroHorarioAluno.json`

Comando:

```bash
npm run schedule:export -- --input data/QuadroHorarioAluno.json
```

Saída:

- `output/GoogleAgenda.csv`
- `output/ThunderbirdAgenda.ics`

### Analisar no terminal

```bash
npm run schedule:analyze -- --input data/QuadroHorarioAluno.json
```

### Baixar JSON via cookie

Há também o utilitário:

```bash
npm run totvs:fetch -- --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

Ele salva o arquivo por padrão em `data/QuadroHorarioAluno.json`.

## API REST

Base URL local do backend: `http://localhost:5000/api`

### Endpoints disponíveis

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/extract-analyze`
- `POST /api/totvs-login`

Observação:

- exportação CSV e ICS da interface web é client-side
- a API do app Node não expõe endpoints de exportação porque a interface gera CSV e ICS localmente

Detalhes completos estão em [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md).

## Formato do JSON de entrada

Estrutura esperada:

```json
{
  "data": {
    "SHorarioAluno": [
      {
        "NOME": "Matemática",
        "DATAINICIAL": "2025-03-10T00:00:00",
        "DATAFINAL": "2025-03-10T00:00:00",
        "HORAINICIAL": "08:00:00",
        "HORAFINAL": "10:00:00",
        "PREDIO": "Campus",
        "BLOCO": "A",
        "SALA": "101",
        "CODTURMA": "MAT01",
        "DIASEMANA": "1"
      }
    ]
  }
}
```

Campos mais relevantes:

- `NOME`
- `DATAINICIAL`
- `DATAFINAL`
- `HORAINICIAL`
- `HORAFINAL`
- `PREDIO`, `BLOCO`, `SALA`
- `CODTURMA`, `CODSUBTURMA`, `NOMEREDUZIDO`, `URLAULAONLINE`

## Arquivos de saída

### CSV

- nome padrão: `GoogleAgenda.csv`
- datas em formato `MM/DD/YYYY`
- compatível com importação do Google Calendar

### ICS

- nome padrão: `ThunderbirdAgenda.ics`
- formato `VCALENDAR` + `VEVENT`
- inclui `UID`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION` e `LOCATION`

## Solução de problemas

### Arquivo inválido na análise

Verifique:

- se o arquivo é JSON válido
- se `data` contém a chave `SHorarioAluno`
- se os registros possuem ao menos `NOME` e `DATAINICIAL`

### Frontend sem conexão com a API

Verifique:

- backend Fastify rodando em `:5000`
- frontend rodando em `:5173`
- proxy configurado em `react-app/vite.config.js`
- `SERVER_PORT`, `API_PORT` ou `PORT` corretos no ambiente do Vite

### Falha no TOTVS

Verifique:

- credenciais válidas
- cookie não expirado
- disponibilidade do portal
- variáveis `TOTVS_*` corretas no `.env`, se você sobrescreveu os defaults

## Documentação relacionada

- [README.md](README.md)
- [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md)
- [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md)

## Créditos

Projeto desenvolvido e mantido por Bernardo Gomes.
