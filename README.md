<div align="center">

# 📅 CMMG Calendar Analyzer

*Transforme seu horário acadêmico em calendários organizados*

[![Demo](https://img.shields.io/badge/🚀_Demo-Live-brightgreen)](#demonstração)
[![License](https://img.shields.io/badge/📄_License-MIT-blue)](#licença)
[![Python](https://img.shields.io/badge/🐍_Python-3.6+-blue)](#requisitos)
[![TypeScript](https://img.shields.io/badge/📘_TypeScript-React-blue)](#tecnologias)
[![Status](https://img.shields.io/badge/✅_Status-Production_Ready-success)](#status)

---

**Converta arquivos JSON de horário acadêmico para Google Calendar e Thunderbird com análise inteligente**

![CMMG Calendar Preview](docs/images/preview.png)

</div>

## ✨ Principais Recursos

🎯 **Conversão Inteligente**
- 📱 **CSV** → Google Calendar (formato otimizado)
- 🗓️ **ICS** → Thunderbird, Outlook, Apple Calendar
- 🔄 **Processamento automático** de datas e horários

📊 **Análise Avançada**
- 📈 **Estatísticas completas** de matérias e horários
- 📍 **Mapeamento de locais** e salas
- 📅 **Distribuição temporal** (semanal/mensal)
- 🎨 **Visualizações interativas**

🚀 **Interface Moderna**
- 💻 **Web App** responsiva com drag & drop
- ⚡ **CLI** para automação
- 🌐 **API REST** para integração
- 📱 **PWA Ready** com ícones personalizados

## 🚀 Início Rápido

### 🌐 Interface Web (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cmmg-calendar
cd cmmg-calendar

# Inicie a aplicação completa
./start_app.sh
```

**✅ Pronto!** Acesse: [http://localhost:5173](http://localhost:5173)

### ⚡ Via Linha de Comando

```bash
# Configure o ambiente
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instale dependências
pip install -r requirements.txt

# Converta seu arquivo
python main.py
```

**📂 Arquivos gerados:**
- `output/GoogleAgenda.csv` → 📱 Google Calendar
- `output/ThunderbirdAgenda.ics` → 🗓️ Thunderbird/Outros

## 📱 Como Usar

<details>
<summary><strong>🌐 Interface Web</strong></summary>

1. **📤 Upload**: Arraste seu `QuadroHorarioAluno.json` ou clique para selecionar
2. **🔍 Análise**: Clique em "Analisar Horário" para ver estatísticas
3. **📊 Resultados**: Visualize distribuição de matérias, horários e locais
4. **💾 Download**: Baixe CSV para Google Calendar ou ICS para outros aplicativos

</details>

<details>
<summary><strong>⚡ Linha de Comando</strong></summary>

```bash
# Conversão simples
python main.py

# Análise detalhada
python analyze_schedule.py

# Servidor API
python api_server.py
```

</details>

<details>
<summary><strong>🔗 API REST</strong></summary>

```bash
# Health check
curl http://localhost:5000/health

# Análise de arquivo
curl -X POST -F "file=@data/QuadroHorarioAluno.json" \
     http://localhost:5000/analyze

# Export CSV
curl -X POST -F "file=@data/QuadroHorarioAluno.json" \
     http://localhost:5000/export/csv -o agenda.csv
```

</details>

## 🏗️ Tecnologias

### Backend
- 🐍 **Python 3.6+** com Flask
- 🔒 **Validação** com Pydantic
- ⚡ **Rate Limiting** e CORS
- 📝 **Logging** estruturado

### Frontend
- ⚛️ **React 19** + **TypeScript**
- ⚡ **Vite** para desenvolvimento rápido
- 🎨 **Tailwind CSS** para estilização
- 📱 **Responsive Design**
- 🔄 **Custom Hooks** para gerenciamento de estado

### Recursos Avançados
- 🛡️ **Validação robusta** de dados
- 📊 **Análise estatística** automática
- 🌐 **PWA** com manifest e ícones
- 🔄 **Drag & Drop** de arquivos
- ⚡ **Loading states** e feedback visual

## 📋 Requisitos

- 🐍 Python 3.6+
- 📦 Node.js 16+ (para interface web)
- 💾 ~50MB espaço em disco

## 📖 Documentação Completa

📚 **[DOCUMENTACAO.md](DOCUMENTACAO.md)** - Guia completo com:
- 🎯 Importação detalhada para cada calendário
- 🛠️ Solução de problemas comuns
- 🎨 Personalização e dicas avançadas
- 📱 Configuração de PWA

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. 🍴 Fork o projeto
2. 🌿 Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. 💾 Commit suas mudanças: `git commit -m 'Add: nova funcionalidade'`
4. 📤 Push para a branch: `git push origin feature/nova-funcionalidade`
5. 🔄 Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<div align="center">

**🎓 Desenvolvido para facilitar a vida acadêmica**

⭐ Não esqueça de dar uma estrela se este projeto te ajudou!

</div>
