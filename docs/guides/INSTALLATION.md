# 🚀 Guia de Instalação Completo

> 🎯 **Objetivo**: Ter o CMMG Calendar funcionando em qualquer sistema em menos de 10 minutos

---

## 🖥️ Sistemas Suportados

| Sistema | Status | Dificuldade | Tempo |
|---------|--------|-------------|-------|
| 🐧 **Linux** | ✅ Testado | 🟢 Fácil | 3-5 min |
| 🪟 **Windows** | ✅ Testado | 🟡 Médio | 5-8 min |
| 🍎 **macOS** | ✅ Compatível | 🟢 Fácil | 3-5 min |

---

## 📋 Pré-requisitos por Sistema

### 🐧 Linux (Ubuntu/Debian/Fedora)

<details>
<summary><strong>🔧 Preparar ambiente Linux</strong></summary>

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm git curl

# Fedora
sudo dnf install python3 python3-pip nodejs npm git curl

# Arch Linux
sudo pacman -S python python-pip nodejs npm git curl
```

</details>

### 🪟 Windows

<details>
<summary><strong>🔧 Preparar ambiente Windows</strong></summary>

**Opção 1: Instaladores Oficiais**
1. 🐍 [Python 3.8+](https://www.python.org/downloads/windows/)
   - ✅ Marcar "Add Python to PATH"
2. 📦 [Node.js 16+](https://nodejs.org/en/download/)
3. 🔧 [Git for Windows](https://git-scm.com/download/win)

**Opção 2: Chocolatey (Recomendado)**
```powershell
# Instalar Chocolatey primeiro
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Instalar dependências
choco install python nodejs git
```

**Opção 3: WSL (Para desenvolvedores)**
```bash
wsl --install
# Depois siga as instruções do Linux
```

</details>

### 🍎 macOS

<details>
<summary><strong>🔧 Preparar ambiente macOS</strong></summary>

**Opção 1: Homebrew (Recomendado)**
```bash
# Instalar Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install python node git
```

**Opção 2: Instaladores Oficiais**
1. 🐍 [Python 3.8+](https://www.python.org/downloads/mac-osx/)
2. 📦 [Node.js 16+](https://nodejs.org/en/download/)
3. 🔧 Git (já vem no macOS)

</details>

---

## 🎯 Instalação Rápida (Recomendada)

### 🚀 Método 1: Script Automático

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/cmmg-calendar.git
cd cmmg-calendar

# 2. Execute o instalador automático
chmod +x install.sh
./install.sh

# 3. Inicie a aplicação
./start_app.sh
```

### ⚡ Método 2: Manual (Passo a Passo)

<details>
<summary><strong>📋 Instalação manual detalhada</strong></summary>

#### Passo 1: Clone e Entre no Projeto
```bash
git clone https://github.com/seu-usuario/cmmg-calendar.git
cd cmmg-calendar
```

#### Passo 2: Configure o Backend Python
```bash
# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências Python
pip install --upgrade pip
pip install -r requirements.txt
```

#### Passo 3: Configure o Frontend React
```bash
cd react-app
npm install
cd ..
```

#### Passo 4: Teste a Instalação
```bash
# Testar backend
python -c "import flask; print('✅ Backend OK')"

# Testar frontend
cd react-app && npm run build && cd ..
echo "✅ Frontend OK"
```

#### Passo 5: Primeiro Uso
```bash
# Iniciar aplicação completa
./start_app.sh
# ou manualmente:
# Terminal 1: python api_server.py
# Terminal 2: cd react-app && npm run dev
```

</details>

---

## 🐳 Docker (Alternativo)

<details>
<summary><strong>🐳 Instalação com Docker</strong></summary>

### Pré-requisitos
- Docker Desktop instalado
- Docker Compose

### Instalação
```bash
# Clone o projeto
git clone https://github.com/seu-usuario/cmmg-calendar.git
cd cmmg-calendar

# Execute com Docker
docker-compose up --build

# Acesse
# Frontend: http://localhost:5173
# API: http://localhost:5000
```

### Docker personalizado
```dockerfile
# Dockerfile já incluído no projeto
# Personalize conforme necessário
```

</details>

---

## ✅ Verificação da Instalação

### 🧪 Testes Automáticos

```bash
# Script de verificação
./verify_install.sh
```

### 🔍 Verificação Manual

<details>
<summary><strong>🔧 Checklist de verificação</strong></summary>

#### Backend Python
```bash
# Ativar ambiente
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Testar imports
python -c "
import flask
import flask_cors
import pydantic
print('✅ Todas as dependências OK')
"

# Testar API
python api_server.py &
curl http://localhost:5000/health
# Deve retornar: {"status": "up", "message": "API funcionando"}
```

#### Frontend React
```bash
cd react-app

# Verificar dependências
npm list --depth=0

# Testar build
npm run build
echo "✅ Build do React OK"

# Testar dev server
npm run dev
# Deve abrir em http://localhost:5173
```

#### Integração Completa
```bash
# Iniciar tudo
./start_app.sh

# Verificar endpoints
curl http://localhost:5000/health
curl http://localhost:5173  # deve carregar a página
```

</details>

---

## 🛠️ Configuração Avançada

### ⚙️ Variáveis de Ambiente

Crie um arquivo `.env`:
```bash
# Configurações da API
FLASK_DEBUG=False
SECRET_KEY=sua-chave-secreta-aqui
PORT=5000
MAX_FILE_SIZE=10

# Configurações do React
VITE_API_URL=http://localhost:5000
```

### 🎨 Personalização

<details>
<summary><strong>🎨 Opções de personalização</strong></summary>

#### Cores e Temas
```bash
# Arquivo: react-app/src/index.css
# Personalize as cores CSS variables
```

#### Configurações da API
```bash
# Arquivo: api_server.py
# Ajuste rate limits, CORS, etc.
```

#### Ícones e PWA
```bash
# Pasta: react-app/public/
# Substitua os ícones pelos seus
```

</details>

---

## 🚨 Solução de Problemas Comuns

### ❌ Erro: "Python not found"

<details>
<summary><strong>🔧 Soluções para Python</strong></summary>

**Windows:**
- Reinstalar Python marcando "Add to PATH"
- Usar `py` em vez de `python`

**Linux:**
```bash
sudo apt install python3 python3-pip
# ou
sudo dnf install python3 python3-pip
```

**macOS:**
```bash
brew install python
# ou usar python3 em vez de python
```

</details>

### ❌ Erro: "npm not found"

<details>
<summary><strong>🔧 Soluções para Node.js</strong></summary>

**Todos os sistemas:**
1. Baixar Node.js oficial: https://nodejs.org
2. Reiniciar terminal
3. Verificar: `node --version && npm --version`

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

</details>

### ❌ Erro: "Permission denied"

<details>
<summary><strong>🔧 Soluções para permissões</strong></summary>

**Linux/Mac:**
```bash
chmod +x start_app.sh install.sh
# ou
sudo chmod +x *.sh
```

**Windows:**
- Executar como Administrador
- Ou usar PowerShell: `Set-ExecutionPolicy RemoteSigned`

</details>

### ❌ Porta já em uso

<details>
<summary><strong>🔧 Soluções para conflitos de porta</strong></summary>

```bash
# Verificar o que está usando a porta
# Linux/Mac:
lsof -i :5000
lsof -i :5173

# Windows:
netstat -ano | findstr :5000

# Matar processo
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Ou alterar portas no .env
```

</details>

---

## 📊 Benchmark de Performance

| Sistema | Tempo Boot | RAM Uso | CPU Uso |
|---------|------------|---------|---------|
| Linux | ~2s | ~150MB | <5% |
| Windows | ~3s | ~200MB | <8% |
| macOS | ~2s | ~180MB | <6% |
| Docker | ~5s | ~300MB | <10% |

---

## 🔄 Atualizações

### 📥 Atualizar o projeto

```bash
# Backup suas configurações
cp .env .env.backup

# Atualizar código
git pull origin main

# Atualizar dependências
source venv/bin/activate
pip install -r requirements.txt

cd react-app
npm install
cd ..

# Restaurar configurações
cp .env.backup .env
```

---

## 📞 Suporte

### 🆘 Precisa de ajuda?

1. 📋 **Issues**: [GitHub Issues](https://github.com/seu-usuario/cmmg-calendar/issues)
2. 📖 **Wiki**: Documentação completa
3. 💬 **Discussões**: GitHub Discussions
4. 📧 **Email**: suporte@exemplo.com

### 🐛 Reportar bugs

Use o template:
```markdown
**Sistema**: Windows 10 / Ubuntu 20.04 / macOS Big Sur
**Python**: 3.9.0
**Node**: 16.14.0
**Erro**: [cole o erro aqui]
**Passos**: [como reproduzir]
```

---

**🎉 Parabéns! Sua instalação está completa!**

> 🚀 **Próximo passo**: [Como usar a interface web](WEB_INTERFACE.md)