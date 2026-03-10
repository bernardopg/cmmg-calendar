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

- `api_server.py` é o backend canônico em produção local
- `main.py` e `analyze_schedule.py` cobrem a operação por CLI
- `exports.py` concentra a geração de CSV e ICS
- `src/` contém a refatoração modular do backend, ainda em evolução
- `react-app/` contém o frontend React + TypeScript

## Requisitos

- Python 3.10+
- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+

## Instalação

### Execução rápida

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
./start_app.sh
```

O script instala dependências ausentes, valida Node.js e sobe backend mais frontend.

### Execução manual

Backend:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api_server.py
```

Frontend:

```bash
cd react-app
npm install
npm run dev
```

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
python main.py
```

Saída:

- `output/GoogleAgenda.csv`
- `output/ThunderbirdAgenda.ics`

### Analisar no terminal

```bash
python analyze_schedule.py
```

### Baixar JSON via cookie

Há também o utilitário:

```bash
python scripts/fetch_quadro_horario.py --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

Ele salva o arquivo por padrão em `data/QuadroHorarioAluno.json`.

## API REST

Base URL padrão: `http://localhost:5000`

### Endpoints disponíveis

- `GET /health`
- `POST /analyze`
- `POST /extract-analyze`
- `POST /totvs-login`
- `POST /export/csv`
- `POST /export/ics`

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

- backend rodando em `:5000`
- frontend rodando em `:5173`
- proxy configurado em `react-app/vite.config.js`

### Falha no TOTVS

Verifique:

- credenciais válidas
- cookie não expirado
- disponibilidade do portal

## Documentação relacionada

- [README.md](README.md)
- [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md)
- [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md)

## Créditos

Projeto desenvolvido e mantido por Bernardo Gomes.
