# CMMG Calendar Analyzer

Converte o arquivo `QuadroHorarioAluno.json` em calendários utilizáveis (CSV para Google Calendar e ICS para Thunderbird/Outros) e oferece análise estatística via Web, API e CLI.

## Status

- Backend Flask funcional (`api_server.py`)
- Frontend React + TypeScript funcional (`react-app/`)
- Exportação CSV e ICS funcional (`exports.py`)
- CLI funcional para geração local (`main.py`)

## Principais Recursos

- Conversão de horários acadêmicos para:
  - `GoogleAgenda.csv` (Google Calendar)
  - `ThunderbirdAgenda.ics` (Thunderbird, Outlook, Apple Calendar e clientes compatíveis com iCalendar)
- Análise de dados de horário:
  - total de registros válidos/inválidos
  - distribuição por disciplinas, horários, locais, dias e meses
- Interface web com upload de arquivo e exportação
- API REST para integração com outros sistemas

## Requisitos

- Python 3.10+
- Node.js 18+
- npm 9+
- Sistema Linux, macOS ou Windows

## Início Rápido

### Opção 1: Web (recomendada)

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
./start_app.sh
```

Abra:

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>

### Opção 2: CLI

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Arquivos gerados:

- `output/GoogleAgenda.csv`
- `output/ThunderbirdAgenda.ics`

## Uso por Interface

1. Abra `http://localhost:5173`
2. Envie o arquivo JSON do horário
3. Clique em **Analisar Horário**
4. Exporte CSV ou ICS pelo painel de resultados

## API (resumo)

- `GET /health`
- `POST /analyze` (multipart com `file`)
- `POST /export/csv` (multipart com `file` ou JSON no body)
- `POST /export/ics` (multipart com `file` ou JSON no body)

Exemplo:

```bash
curl -X POST -F "file=@data/QuadroHorarioAluno.json" http://localhost:5000/analyze
```

## Estrutura do Projeto

```text
cmmg-calendar/
├── api_server.py
├── main.py
├── analyze_schedule.py
├── exports.py
├── start_app.sh
├── src/                 # arquitetura modular em evolução
├── react-app/
└── docs/
```

## Documentação

- Visão geral: [DOCUMENTACAO.md](DOCUMENTACAO.md)
- Índice de documentação: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
- Instalação: [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)
- Interface web: [docs/guides/WEB_INTERFACE.md](docs/guides/WEB_INTERFACE.md)
- API: [docs/guides/API_REFERENCE.md](docs/guides/API_REFERENCE.md)
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
