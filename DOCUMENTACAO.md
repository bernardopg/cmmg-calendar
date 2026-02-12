# Documentação Completa

Guia oficial de uso, instalação e integração do projeto CMMG Calendar Analyzer.

## Sumário

1. [Visão geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Uso pela interface web](#uso-pela-interface-web)
5. [Uso via CLI](#uso-via-cli)
6. [API REST](#api-rest)
7. [Formato do JSON de entrada](#formato-do-json-de-entrada)
8. [Formato dos arquivos de saída](#formato-dos-arquivos-de-saída)
9. [Solução de problemas](#solução-de-problemas)
10. [Créditos](#créditos)

## Visão geral

O CMMG Calendar Analyzer recebe um JSON acadêmico (`QuadroHorarioAluno.json`) e permite:

- analisar a grade de horários;
- exportar para CSV compatível com Google Calendar;
- exportar para ICS compatível com Thunderbird e outros clientes iCalendar.

Formas de uso disponíveis:

- Interface web (React + API Flask)
- API REST
- CLI local

## Requisitos

- Python 3.10+
- Node.js 18+
- npm 9+

Dependências do backend:

```bash
pip install -r requirements.txt
```

Dependências do frontend:

```bash
cd react-app
npm install
```

## Instalação

### Execução rápida (web)

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
./start_app.sh
```

Serviços disponíveis:

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>

### Execução manual

Terminal 1 (API):

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api_server.py
```

Terminal 2 (frontend):

```bash
cd react-app
npm install
npm run dev
```

## Uso pela interface web

1. Abra `http://localhost:5173`
2. Faça upload do arquivo JSON
3. Clique em **Analisar Horário**
4. Revise estatísticas e distribuições
5. Exporte em CSV ou ICS

## Uso via CLI

### Conversão para CSV + ICS

Pré-requisito:

- arquivo de entrada em `data/QuadroHorarioAluno.json`

Comando:

```bash
python main.py
```

Saída:

- `output/GoogleAgenda.csv`
- `output/ThunderbirdAgenda.ics`

### Análise estatística em terminal

```bash
python analyze_schedule.py
```

## API REST

Base URL padrão: `http://localhost:5000`

### `GET /health`

Retorna status da API.

Resposta esperada:

```json
{
  "status": "up",
  "message": "API funcionando"
}
```

### `POST /analyze`

Recebe `multipart/form-data` com campo `file` (JSON) e retorna estatísticas.

Exemplo:

```bash
curl -X POST -F "file=@data/QuadroHorarioAluno.json" http://localhost:5000/analyze
```

### `POST /export/csv`

Aceita:

- `multipart/form-data` com campo `file`, ou
- JSON diretamente no corpo da requisição.

Retorna arquivo CSV para download.

Exemplo com arquivo:

```bash
curl -X POST -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/export/csv -o GoogleAgenda.csv
```

### `POST /export/ics`

Aceita:

- `multipart/form-data` com campo `file`, ou
- JSON diretamente no corpo da requisição.

Retorna arquivo ICS para download.

Exemplo com arquivo:

```bash
curl -X POST -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/export/ics -o ThunderbirdAgenda.ics
```

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

Campos mais relevantes para exportação:

- `NOME`
- `DATAINICIAL`
- `DATAFINAL` (opcional; usa `DATAINICIAL` como fallback)
- `HORAINICIAL`
- `HORAFINAL`
- `PREDIO`, `BLOCO`, `SALA`
- `CODTURMA`, `CODSUBTURMA`, `NOMEREDUZIDO`, `URLAULAONLINE`

## Formato dos arquivos de saída

### CSV (`GoogleAgenda.csv`)

Colunas:

- Subject
- Start Date
- Start Time
- End Date
- End Time
- All Day Event
- Description
- Location
- Private

Observações:

- datas em formato `MM/DD/YYYY`
- compatível com importação do Google Calendar

### ICS (`ThunderbirdAgenda.ics`)

Formato iCalendar (`VCALENDAR` + `VEVENT`) com:

- `UID` único por evento
- `DTSTAMP` em UTC
- `DTSTART` e `DTEND`
- `SUMMARY`, `DESCRIPTION`, `LOCATION`

## Solução de problemas

### Arquivo não encontrado na CLI

Erro comum:

- `data/QuadroHorarioAluno.json` inexistente.

Solução:

- crie a pasta `data/` e coloque o arquivo com esse nome;
- ou adapte o caminho em `main.py`.

### API retornando erro 400

Causas comuns:

- campo `file` ausente no multipart;
- arquivo não é `.json`;
- JSON malformado;
- estrutura sem `data.SHorarioAluno`.

### Frontend sem conexão com API

Verifique:

- API rodando na porta 5000;
- frontend rodando na porta 5173;
- proxy configurado em `react-app/vite.config.js`.

## Créditos

Projeto desenvolvido e mantido por:

- Bernardo Gomes
- E-mail: <bernardo.gomes@bebitterbebetter.com.br>
- Site: bebitterbebetter.com.br
- Instagram/X: @be.pgomes
- GitHub: [bernardopg](https://github.com/bernardopg)

Thunderbird

- “Arquivo não reconhecido”/“Erro ao importar”: garantir `.ics`, reiniciar e tentar de novo
- Eventos ausentes: verifique filtros de visualização; o `.ics` contém apenas eventos válidos

Espaço/ambiente

- Verifique espaço em disco e dependências instaladas (`requirements.txt`)

---

## Atualizações Futuras

Ao receber um novo JSON:

1. Substitua `data/QuadroHorarioAluno.json`
2. Rode `python main.py` para novos CSV/ICS
3. Reimporte no Google/Thunderbird

Na interface web:

- Refaça o upload do novo JSON e analise novamente

---

Boas aulas e boa organização!
