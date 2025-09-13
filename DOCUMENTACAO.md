<div align="center">

# 📚 Documentação Completa
## CMMG Calendar Analyzer

*Guia completo para conversão e análise de horários acadêmicos*

---

🎯 **O que você pode fazer:**

📱 **Google Calendar** • 🗓️ **Thunderbird** • 📊 **Estatísticas** • 🌐 **Interface Web**

</div>

## 📚 Índice Rápido

> 💡 **Dica**: Use Ctrl+F para encontrar rapidamente o que precisa!

| Seção | Descrição | Tempo Estimado |
|---------|-------------|----------------|
| [🚀 Início Rápido](#-início-rápido) | Começar em 2 minutos | 2 min |
| [📱 Google Calendar](#-google-calendar-csv) | Importar para Google | 5 min |
| [🗓️ Thunderbird](#-thunderbird-ics) | Importar para Thunderbird | 3 min |
| [🌐 Interface Web](#-interface-web) | Usar a aplicação web | 1 min |
| [🔧 Solução de Problemas](#-solução-de-problemas) | Resolver dúvidas comuns | - |

---

## 🗂️ Documentação Adicional

📖 **Guias Detalhados Disponíveis:**
- 📱 [Importação Google Calendar](docs/guides/GOOGLE_CALENDAR.md)
- ⚡ [Importação Thunderbird](docs/guides/THUNDERBIRD.md)
- 🚀 [Guia de Instalação Completo](docs/guides/INSTALLATION.md)
- 📚 [Índice de Toda Documentação](docs/DOCUMENTATION_INDEX.md)

---

---

## 🎯 Visão Geral

<div align="center">

```mermaid
graph LR
    A[📄 JSON] --> B[🔄 Processamento]
    B --> C[📱 Google Calendar CSV]
    B --> D[🗓️ Thunderbird ICS]
    B --> E[📊 Análise Web]
```

</div>

**🎨 O que este projeto faz:**

✨ Transforma seu arquivo JSON de horário acadêmico em calendários organizados

**📦 Formatos de saída:**
- 📱 **CSV** → `output/GoogleAgenda.csv` (Google Calendar)
- 🗓️ **ICS** → `output/ThunderbirdAgenda.ics` (Thunderbird e padrão iCalendar)
- 📊 **Relatório Web** → Estatísticas e análises interativas

**✨ Bônus:**
- Interface web moderna com drag & drop
- Análise inteligente de padrões de horário
- Visualizações de estatísticas
- API REST para integração

## 💻 Requisitos

<details>
<summary><strong>🔵 Requisitos Mínimos</strong></summary>

| Componente | Versão | Obrigatório para |
|-----------|-------|------------------|
| 🐍 Python | 3.6+ | CLI + API |
| 📦 Node.js | 16+ | Interface Web |
| 💾 Espaço | ~50MB | Instalação |

**🔧 Dependências Python:**
```bash
pip install -r requirements.txt
```

**🎨 Dependências Frontend:**
```bash
cd react-app && npm install
```

</details>

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

## 🚀 Início Rápido

> 🏁 **Meta**: Ter seus horários no calendário em menos de 5 minutos!

### 🔥 Opção 1: Interface Web (Recomendada)

```bash
# 1. Clone e entre no projeto
git clone <seu-repo>
cd cmmg-calendar

# 2. Execute o script mágico 🪄
./start_app.sh

# 3. Abra no navegador
# 🌐 http://localhost:5173
```

### ⚡ Opção 2: CLI Rápido

```bash
# 1. Configure o ambiente
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 2. Instale dependências
pip install -r requirements.txt

# 3. Coloque seu JSON em data/QuadroHorarioAluno.json
# 4. Execute a conversão
python main.py
```

✅ **Arquivos gerados:**
- 📱 `output/GoogleAgenda.csv` (Google Calendar)
- 🗓️ `output/ThunderbirdAgenda.ics` (Thunderbird/outros)

📍 **Próximo passo:** [Importar nos calendários](#-google-calendar-csv)

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
