#!/bin/bash

# Script para iniciar a aplicação completa
# Resolve conflitos de porta automaticamente para backend e frontend

echo "🎓 Configurando Analisador de Horário Acadêmico..."

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

API_PID=""
REACT_PID=""

API_HOST="${HOST:-127.0.0.1}"
API_CONNECT_HOST="$API_HOST"
if [ "$API_CONNECT_HOST" = "0.0.0.0" ]; then
    API_CONNECT_HOST="127.0.0.1"
fi
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
DEFAULT_API_PORT="${PORT:-5000}"
DEFAULT_FRONTEND_PORT="${FRONTEND_PORT:-5173}"

TMP_DIR="$BASE_DIR/tmp"
API_LOG="$TMP_DIR/api_server.dev.log"
FRONTEND_LOG="$TMP_DIR/frontend.dev.log"
RUNTIME_ENV_FILE="$TMP_DIR/runtime.env"

mkdir -p "$TMP_DIR"
: > "$API_LOG"
: > "$FRONTEND_LOG"

REQUIRED_NODE_VERSION_DISPLAY="20.19+ ou 22.12+"

display_url() {
    local host="$1"
    local port="$2"

    if [ "$host" = "127.0.0.1" ] || [ "$host" = "0.0.0.0" ]; then
        echo "http://localhost:$port"
        return
    fi

    echo "http://$host:$port"
}

describe_port_usage() {
    local port="$1"
    local usage=""

    usage="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | tail -n +2)"
    if [ -n "$usage" ]; then
        printf '%s\n' "$usage"
        return
    fi

    ss -ltn "( sport = :$port )" 2>/dev/null | tail -n +2
}

find_free_port() {
    local preferred_port="$1"
    local host="$2"

    ./venv/bin/python -m src.config.port_utils \
        --preferred-port "$preferred_port" \
        --host "$host"
}

resolve_listening_port() {
    local pid="$1"
    local attempts="${2:-20}"
    local port=""

    for ((i = 1; i <= attempts; i++)); do
        port="$(
            lsof -Pan -p "$pid" -iTCP -sTCP:LISTEN -FnP 2>/dev/null |
                awk '
                    /^n/ {
                        addr = $0
                        sub(/^n/, "", addr)

                        n = split(addr, parts, ":")
                        port = parts[n]

                        if (port ~ /^[0-9]+$/) {
                            print port
                            exit
                        }
                    }
                '
        )"

        if [ -n "$port" ]; then
            printf '%s\n' "$port"
            return 0
        fi

        if ! kill -0 "$pid" 2>/dev/null; then
            return 1
        fi

        sleep 1
    done

    if kill -0 "$pid" 2>/dev/null; then
        printf 'Failed to resolve listening port for PID %s after %s attempts\n' "$pid" "$attempts" >&2
    fi

    return 1
}

wait_for_http() {
    local url="$1"
    local label="$2"
    local pid="$3"
    local attempts="${4:-30}"

    for ((i = 1; i <= attempts; i++)); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            return 0
        fi

        if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
            echo "❌ $label encerrou antes de responder."
            return 1
        fi

        sleep 1
    done

    echo "❌ $label não respondeu em tempo hábil: $url"
    return 1
}

show_log_tail() {
    local label="$1"
    local file="$2"

    if [ -f "$file" ] && [ -s "$file" ]; then
        echo ""
        echo "📄 Últimas linhas de $label:"
        tail -n 20 "$file"
    fi
}

stop_servers() {
    if [ -n "$REACT_PID" ]; then
        kill "$REACT_PID" 2>/dev/null
        wait "$REACT_PID" 2>/dev/null
    fi

    if [ -n "$API_PID" ]; then
        kill "$API_PID" 2>/dev/null
        wait "$API_PID" 2>/dev/null
    fi
}

abort_startup() {
    local message="$1"

    echo "❌ $message"
    show_log_tail "backend" "$API_LOG"
    show_log_tail "frontend" "$FRONTEND_LOG"
    stop_servers
    exit 1
}

cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    stop_servers
    echo "✅ Servidores parados."
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "📦 Verificando dependências Python..."

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

if ! ./venv/bin/python -c "import flask, requests" 2>/dev/null; then
    echo "⬇️  Instalando dependências Python..."
    ./venv/bin/pip install -r requirements.txt
else
    echo "✅ Dependências Python já instaladas"
fi

echo "🔎 Resolvendo portas livres..."

API_PORT="$(find_free_port "$DEFAULT_API_PORT" "$API_HOST")" || abort_startup "Não foi possível resolver uma porta livre para a API."
if [ "$API_PORT" != "$DEFAULT_API_PORT" ]; then
    echo "⚠️  Porta preferida da API ($DEFAULT_API_PORT) já está em uso."
    PORT_USAGE="$(describe_port_usage "$DEFAULT_API_PORT")"
    if [ -n "$PORT_USAGE" ]; then
        echo "$PORT_USAGE" | sed 's/^/   /'
    fi
    echo "➡️  API será iniciada automaticamente na porta $API_PORT."
else
    echo "✅ API usará a porta $API_PORT"
fi

FRONTEND_PORT="$(find_free_port "$DEFAULT_FRONTEND_PORT" "$FRONTEND_HOST")" || abort_startup "Não foi possível resolver uma porta livre para o frontend."
if [ "$FRONTEND_PORT" != "$DEFAULT_FRONTEND_PORT" ]; then
    echo "⚠️  Porta preferida do frontend ($DEFAULT_FRONTEND_PORT) já está em uso."
    PORT_USAGE="$(describe_port_usage "$DEFAULT_FRONTEND_PORT")"
    if [ -n "$PORT_USAGE" ]; then
        echo "$PORT_USAGE" | sed 's/^/   /'
    fi
    echo "➡️  Frontend será iniciado automaticamente na porta $FRONTEND_PORT."
else
    echo "✅ Frontend usará a porta $FRONTEND_PORT"
fi

export HOST="$API_HOST"
export PORT="$API_PORT"
export FRONTEND_PORT="$FRONTEND_PORT"

echo "🚀 Iniciando servidor da API..."
./venv/bin/python api_server.py >"$API_LOG" 2>&1 &
API_PID=$!
echo "📡 API iniciada com PID: $API_PID"

ACTUAL_API_PORT="$(resolve_listening_port "$API_PID" 20)" || abort_startup "Não foi possível detectar a porta final da API."
API_PORT="$ACTUAL_API_PORT"
export PORT="$API_PORT"
export API_PORT="$API_PORT"

API_URL="http://$API_CONNECT_HOST:$API_PORT"
API_BROWSER_URL="$(display_url "$API_CONNECT_HOST" "$API_PORT")"

if ! wait_for_http "$API_URL/health" "API" "$API_PID" 30; then
    abort_startup "API não está respondendo em $API_BROWSER_URL."
fi

echo "✅ API está funcionando em $API_BROWSER_URL"

echo "⚛️  Iniciando servidor React..."
cd "$BASE_DIR/react-app"

if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/vite" ]; then
    echo "⬇️  Instalando dependências do frontend..."
    npm install || abort_startup "Falha ao instalar dependências do frontend."
else
    echo "✅ Dependências do frontend já instaladas"
fi

export VITE_PORT="$FRONTEND_PORT"
export VITE_HOST="$FRONTEND_HOST"
export VITE_API_PROXY_TARGET="$API_URL"

npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" --strictPort >"$FRONTEND_LOG" 2>&1 &
REACT_PID=$!
echo "🌐 React iniciado com PID: $REACT_PID"

if [ "$FRONTEND_HOST" = "0.0.0.0" ]; then
    FRONTEND_CONNECT_HOST="127.0.0.1"
else
    FRONTEND_CONNECT_HOST="$FRONTEND_HOST"
fi

FRONTEND_URL="http://$FRONTEND_CONNECT_HOST:$FRONTEND_PORT"
FRONTEND_BROWSER_URL="$(display_url "$FRONTEND_CONNECT_HOST" "$FRONTEND_PORT")"

if ! wait_for_http "$FRONTEND_URL" "Frontend" "$REACT_PID" 40; then
    abort_startup "Frontend não está respondendo em $FRONTEND_BROWSER_URL."
fi

cat > "$RUNTIME_ENV_FILE" <<EOF
API_HOST=$API_HOST
API_PORT=$API_PORT
API_URL=$API_URL
FRONTEND_HOST=$FRONTEND_HOST
FRONTEND_PORT=$FRONTEND_PORT
FRONTEND_URL=$FRONTEND_URL
VITE_API_PROXY_TARGET=$API_URL
EOF

echo ""
echo "🎉 Aplicação iniciada com sucesso!"
echo ""
echo "📋 Informações importantes:"
echo "   🔧 API (Backend): $API_BROWSER_URL"
echo "   🌐 Interface Web: $FRONTEND_BROWSER_URL"
echo "   📝 Log backend: $API_LOG"
echo "   📝 Log frontend: $FRONTEND_LOG"
echo "   ⚙️  Runtime env: $RUNTIME_ENV_FILE"
echo ""
echo "📁 Para usar a aplicação:"
echo "   1. Abra $FRONTEND_BROWSER_URL no seu navegador"
echo "   2. Faça upload do arquivo QuadroHorarioAluno.json"
echo "   3. Clique em 'Analisar Horário'"
echo ""
echo "⏹️  Para parar os servidores:"
echo "   kill $API_PID $REACT_PID"
echo ""
echo "💡 Mantenha este terminal aberto enquanto estiver usando o modo monitorado."
echo "   Para deixar em background de forma persistente, use seu gerenciador de processos preferido."
echo ""
echo "📊 Monitorando aplicação... (Pressione Ctrl+C para parar tudo)"

wait
