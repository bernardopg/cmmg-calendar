#!/bin/bash

# Script para iniciar a aplicação completa
# Analisador de Horário Acadêmico

echo "🎓 Configurando Analisador de Horário Acadêmico..."

# Diretório base (resolve automaticamente a partir da localização do script)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Instalar dependências Python se necessário
echo "📦 Verificando dependências Python..."

REQUIRED_NODE_VERSION_DISPLAY="20.19+ ou 22.12+"

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "🏗️  Criando ambiente virtual Python..."
    python3 -m venv venv
fi

echo "🟢 Verificando ambiente Node.js..."

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Erro: Node.js não encontrado. Instale Node.js ${REQUIRED_NODE_VERSION_DISPLAY}."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Erro: npm não encontrado. Instale npm compatível com Node.js ${REQUIRED_NODE_VERSION_DISPLAY}."
    exit 1
fi

NODE_VERSION="$(node -p "process.versions.node")"
echo "🔢 Node.js detectado: $NODE_VERSION"

if ! node <<'NODE'
const [major, minor] = process.versions.node.split('.').map(Number);
const supported =
  major >= 23 ||
  (major === 22 && minor >= 12) ||
  (major === 20 && minor >= 19);

process.exit(supported ? 0 : 1);
NODE
then
    echo "❌ Erro: versão do Node.js incompatível. Use Node.js ${REQUIRED_NODE_VERSION_DISPLAY}."
    exit 1
fi

# Ativar ambiente virtual e instalar dependências
if ! ./venv/bin/python -c "import flask, requests" 2>/dev/null; then
    echo "⬇️  Instalando dependências Python..."
    ./venv/bin/pip install -r requirements.txt
else
    echo "✅ Dependências Python já instaladas"
fi

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0  # Porta está em uso
    else
        return 1  # Porta está livre
    fi
}

# Verificar se as portas estão disponíveis
if check_port 5000; then
    echo "⚠️  Porta 5000 já está em uso. O servidor da API pode já estar rodando."
else
    echo "✅ Porta 5000 está disponível para a API"
fi

if check_port 5173; then
    echo "⚠️  Porta 5173 já está em uso. O servidor React pode já estar rodando."
else
    echo "✅ Porta 5173 está disponível para o React"
fi

# Iniciar servidor da API em background
echo "🚀 Iniciando servidor da API..."
./venv/bin/python api_server.py &
API_PID=$!
echo "📡 API iniciada com PID: $API_PID"

# Aguardar um pouco para a API inicializar
sleep 3

# Verificar se a API está funcionando
if curl -s http://localhost:5000/health >/dev/null; then
    echo "✅ API está funcionando!"
else
    echo "❌ Erro: API não está respondendo"
fi

# Iniciar servidor React
echo "⚛️  Iniciando servidor React..."
cd react-app

if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/vite" ]; then
    echo "⬇️  Instalando dependências do frontend..."
    npm install
else
    echo "✅ Dependências do frontend já instaladas"
fi

npm run dev &
REACT_PID=$!
echo "🌐 React iniciado com PID: $REACT_PID"

# Aguardar um pouco
sleep 5

echo ""
echo "🎉 Aplicação iniciada com sucesso!"
echo ""
echo "📋 Informações importantes:"
echo "   🔧 API (Backend): http://localhost:5000"
echo "   🌐 Interface Web: http://localhost:5173"
echo ""
echo "📁 Para usar a aplicação:"
echo "   1. Abra http://localhost:5173 no seu navegador"
echo "   2. Faça upload do arquivo QuadroHorarioAluno.json"
echo "   3. Clique em 'Analisar Horário'"
echo ""
echo "⏹️  Para parar os servidores:"
echo "   kill $API_PID $REACT_PID"
echo ""
echo "💡 Mantenha este terminal aberto enquanto estiver usando o modo monitorado."
echo "   Para deixar em background de forma persistente, use seu gerenciador de processos preferido."

# Manter o script ativo para mostrar logs se necessário
echo "📊 Monitorando aplicação... (Pressione Ctrl+C para parar tudo)"

# Função para cleanup quando o script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $API_PID $REACT_PID 2>/dev/null
    echo "✅ Servidores parados."
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Aguardar indefinidamente
wait
