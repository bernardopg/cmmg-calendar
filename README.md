# Conversor de Horário Acadêmico para Calendários

Este script converte o arquivo JSON do quadro de horários de aluno para formatos compatíveis com diferentes aplicações de calendário:

- **CSV**: Para importação no Google Calendar
- **ICS**: Para importação no Thunderbird e outros clientes de calendário

## 📁 Estrutura do Projeto

```
cmmg-calendar/
├── main.py                     # Script principal
├── analyze_schedule.py         # Script de análise dos dados
├── data/
│   └── QuadroHorarioAluno.json # Arquivo JSON de entrada
├── output/
│   ├── GoogleAgenda.csv        # Arquivo CSV para Google Calendar
│   └── ThunderbirdAgenda.ics   # Arquivo ICS para Thunderbird
├── README.md                   # Este arquivo
├── IMPORTACAO.md              # Guia para Google Calendar
└── THUNDERBIRD.md             # Guia para Thunderbird
```

## 🚀 Como Usar

### 1. Executar o Script

```bash
cd /home/bitter/dev/cmmg-calendar
python main.py
```

O script gera automaticamente ambos os arquivos:

- `output/GoogleAgenda.csv` (para Google Calendar)
- `output/ThunderbirdAgenda.ics` (para Thunderbird)

### 2. Importar nos Calendários

#### Google Calendar

Siga o guia detalhado em [`IMPORTACAO.md`](IMPORTACAO.md)

#### Thunderbird

Siga o guia detalhado em [`THUNDERBIRD.md`](THUNDERBIRD.md)

#### Outros Clientes

O arquivo `.ics` funciona em qualquer aplicação que suporte o padrão iCalendar:

- Evolution (Linux)
- Apple Calendar (macOS)
- Outlook (Windows/macOS)
- KDE Kontact (Linux)

## 📊 Informações Processadas

O script extrai e organiza as seguintes informações do JSON:

- **Subject/Summary**: Nome da matéria (campo `NOME`)
- **Start/End Date**: Data da aula (campos `DATAINICIAL`/`DATAFINAL`)
- **Start/End Time**: Horário da aula (campos `HORAINICIAL`/`HORAFINAL`)
- **Location**: Localização completa com prédio, bloco e sala
- **Description**: Informações da turma (código da turma, subturma, código reduzido)

### Diferenças entre Formatos

| Característica | CSV (Google) | ICS (Thunderbird) |
|---|---|---|
| **Formato de Data** | MM/DD/YYYY | YYYYMMDDTHHMMSS |
| **Eventos Privados** | Sim (padrão) | Não especificado |
| **UID Único** | Não | Sim (UUID) |
| **Fuso Horário** | Implícito | America/Sao_Paulo |
| **Metadados** | Básicos | Completos (VCALENDAR) |

## 🔧 Scripts Auxiliares

### Análise de Dados

```bash
python analyze_schedule.py
```

Mostra estatísticas detalhadas:

- Total de eventos por matéria
- Distribuição por horários
- Locais mais utilizados
- Distribuição mensal

## 📝 Formato de Entrada

O script espera um arquivo JSON com a seguinte estrutura:

```json
{
  "data": {
    "SHorarioAluno": [
      {
        "NOME": "FUNDAMENTOS DE SEMIOLOGIA",
        "DATAINICIAL": "2025-08-04T00:00:00",
        "DATAFINAL": "2025-08-04T00:00:00",
        "HORAINICIAL": "07:00",
        "HORAFINAL": "07:50",
        "CODTURMA": "M81C425.2",
        "CODSUBTURMA": "M81C425.2.G02",
        "NOMEREDUZIDO": "7073",
        "PREDIO": "3-0 - HOSPITAL CIÊNCIAS MÉDICAS",
        "BLOCO": "4º A - 4º A",
        "SALA": "CLI MEDICA - ENFERMARIA CLÍNICA MÉDICA"
      }
    ]
  }
}
```

## 🛠️ Requisitos

- Python 3.6+
- Módulos padrão: `csv`, `json`, `os`, `datetime`

## ⚠️ Observações

- Eventos sem nome (`NOME`) ou data (`DATAINICIAL`) são ignorados
- As datas são convertidas do formato ISO para o formato MM/DD/YYYY
- Eventos são marcados como privados por padrão
- O script cria automaticamente a pasta `output/` se ela não existir
