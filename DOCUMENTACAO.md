# 📚 Documentação Unificada — CMMG Calendar

Conversor e analisador de horário acadêmico que transforma o JSON do Quadro de Horário do Aluno em arquivos prontos para importação em calendários e oferece uma interface web para análise.

- Saídas geradas:
  - CSV para Google Calendar
  - ICS (iCalendar) para Thunderbird e outros clientes
- Interface Web: upload do JSON e análise com estatísticas

---

## 🧭 Sumário

- [📚 Documentação Unificada — CMMG Calendar](#-documentação-unificada--cmmg-calendar)
  - [🧭 Sumário](#-sumário)
  - [Visão Geral](#visão-geral)
  - [Requisitos](#requisitos)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Uso Rápido (CLI)](#uso-rápido-cli)
  - [Importação nos Calendários](#importação-nos-calendários)
    - [Google Calendar (CSV)](#google-calendar-csv)
    - [Thunderbird (ICS)](#thunderbird-ics)
    - [Outros Clientes Compatíveis](#outros-clientes-compatíveis)
  - [Aplicação Web](#aplicação-web)
    - [Iniciar (Script recomendado)](#iniciar-script-recomendado)
    - [Iniciar manualmente](#iniciar-manualmente)
    - [Como usar a interface](#como-usar-a-interface)
    - [Portas](#portas)
  - [Análise via Script](#análise-via-script)
  - [Resultados Esperados](#resultados-esperados)
  - [Detalhes dos Formatos](#detalhes-dos-formatos)
  - [Personalização e Dicas](#personalização-e-dicas)
  - [Solução de Problemas](#solução-de-problemas)
  - [Atualizações Futuras](#atualizações-futuras)

---

## Visão Geral

Este projeto converte o arquivo `data/QuadroHorarioAluno.json` em:

- `output/GoogleAgenda.csv` (Google Calendar)
- `output/ThunderbirdAgenda.ics` (Thunderbird e padrão iCalendar)

Além disso, oferece uma aplicação web para upload e análise do JSON com estatísticas e visualizações rápidas.

## Requisitos

- Python 3.6+
- Dependências Python listadas em `requirements.txt`
- Node.js (para rodar a interface web com Vite/React)

Módulos padrão utilizados no conversor: `csv`, `json`, `os`, `datetime`.

## Estrutura do Projeto

```text
cmmg-calendar/
├── main.py                     # Gera CSV + ICS a partir do JSON
├── analyze_schedule.py         # Analisa dados e mostra estatísticas no terminal
├── api_server.py               # API Flask para a interface web
├── start_app.sh                # Script que sobe API + React
├── data/
│   └── QuadroHorarioAluno.json # Arquivo JSON de entrada
├── output/
│   ├── GoogleAgenda.csv        # CSV para Google Calendar
│   └── ThunderbirdAgenda.ics   # ICS para Thunderbird/Outros
├── react-app/                  # Aplicação React (frontend)
└── DOCUMENTACAO.md             # Este arquivo (documentação unificada)
```

---

## Uso Rápido (CLI)

1. Executar o conversor

```bash
python main.py
```

1. Arquivos gerados

- `output/GoogleAgenda.csv` (Google)
- `output/ThunderbirdAgenda.ics` (Thunderbird/iCalendar)

1. Importar nos calendários: consulte as seções abaixo.

---

## Importação nos Calendários

### Google Calendar (CSV)

1. Acesse <https://calendar.google.com> e faça login
2. No menu esquerdo, em “Outros calendários”, clique no ícone “+”
3. Escolha “Importar”
4. Selecione o arquivo `output/GoogleAgenda.csv`
5. Escolha o calendário de destino (dica: crie um "Aulas CMMG")
6. Confirme em “Importar”

Recomendações:

- Garanta fuso horário em Configurações → Fuso horário → America/Sao_Paulo
- O arquivo CSV usa datas no formato MM/DD/YYYY

### Thunderbird (ICS)

Método via menu:

1. Abra o Thunderbird → aba “Agenda” (Ctrl+Shift+C)
2. Arquivo → Importar → Calendário → Avançar
3. “No disco rígido” → Avançar
4. Selecione `output/ThunderbirdAgenda.ics` → Abrir

Alternativas:

- Arrastar e soltar o `.ics` na Agenda
- “Abrir com → Thunderbird” diretamente pelo gerenciador de arquivos

Após importar, personalize nas Propriedades do calendário (nome, cor e lembretes).

### Outros Clientes Compatíveis

O `.ics` é padrão iCalendar (RFC 5545) e funciona em:

- Evolution, KDE Kontact (Linux)
- Apple Calendar (macOS)
- Outlook (Windows/macOS)
- Google Calendar (upload de `.ics` também funciona)

---

## Aplicação Web

Interface para enviar o JSON e ver estatísticas organizadas.

### Iniciar (Script recomendado)

```bash
./start_app.sh
```

Acesse <http://localhost:5173>

### Iniciar manualmente

Em dois terminais:

Backend (API Flask):

```bash
python3 api_server.py
```

Frontend (React):

```bash
cd react-app
npm run dev
```

### Como usar a interface

1. Abra <http://localhost:5173>
2. Clique em “📁 Selecionar arquivo JSON” (ou arraste/solte)
3. Escolha `data/QuadroHorarioAluno.json`
4. Clique em “🔍 Analisar Horário”
5. Veja estatísticas: matérias, horários, locais, dias, meses etc.

### Portas

- API: <http://localhost:5000>
- React: <http://localhost:5173>

---

## Análise via Script

Para estatísticas no terminal:

```bash
python analyze_schedule.py
```

Exibe, por exemplo:

- Total de eventos por matéria
- Distribuição por horários
- Locais mais utilizados
- Distribuição por mês e por dia da semana

---

## Resultados Esperados

- ~677 eventos processados (dependendo do JSON)
- Período típico: agosto a dezembro de 2025
- Exemplos de insights (variáveis conforme dados):
  - Matérias mais frequentes
  - Horários mais comuns (ex.: 14:20–15:10)
  - Locais principais de aula

---

## Detalhes dos Formatos

- Título (SUMMARY): nome da matéria (`NOME`)
- Datas: `DATAINICIAL`/`DATAFINAL`
- Horários: `HORAINICIAL`/`HORAFINAL`
- Local (LOCATION): prédio, bloco e sala
- Descrição: códigos de turma e informações adicionais

Diferenças entre CSV e ICS:

- CSV (Google)
  - Datas: MM/DD/YYYY
  - Eventos privados por padrão
  - Fuso: implícito no calendário
- ICS (Thunderbird/iCalendar)
  - Datas/horas: YYYYMMDDTHHMMSS
  - UID único por evento
  - Fuso recomendado: America/Sao_Paulo
  - Estrutura VCALENDAR/VEVENT

---

## Personalização e Dicas

- Crie um calendário separado “Aulas CMMG” para organizar melhor
- Atribua cores por matéria ou tipo de aula
- Lembretes sugeridos:
  - 15 minutos antes (notificação)
  - 1 hora antes (email, opcional)
  - 1 dia antes (preparação)

---

## Solução de Problemas

Arquivo/execução

- “Arquivo não encontrado”: confirme `data/QuadroHorarioAluno.json`
- Poucos eventos importados: alguns duplicados podem ser filtrados

Datas/fuso horário

- Eventos no horário errado: ajuste para America/Sao_Paulo
  - Google → Configurações → Fuso horário
  - Thunderbird → Configurações → Calendário → Fuso horário

Google Calendar

- “Formato não suportado”: confirme extensão `.csv` gerada pelo script
- “Erro ao processar datas”: verifique fuso e formato MM/DD/YYYY

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
