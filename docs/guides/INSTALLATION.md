# Guia de Instalação

Este guia cobre instalação e execução local do CMMG Calendar Analyzer.

## Requisitos

- Python 3.10+
- Node.js `^20.19.0` ou `>=22.12.0`
- npm 10+
- Git

## 1) Clone do projeto

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
```

## 2) Método recomendado: script único

```bash
./start_app.sh
```

O script:

- cria `venv/` se necessário;
- instala dependências Python se necessário;
- valida a versão mínima do Node.js;
- instala dependências do frontend se `react-app/node_modules` estiver ausente ou incompleto;
- inicia API Flask em `:5000`;
- inicia frontend Vite em `:5173`.

## 3) Método manual

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api_server.py
```

Observação:

- `api_server.py` é o entrypoint canônico do backend atual.

### Frontend

```bash
cd react-app
npm install
npm run dev
```

## 4) Verificação

Backend:

```bash
curl http://localhost:5000/health
```

Retorno esperado:

```json
{"status":"up","message":"API funcionando"}
```

Frontend:

- abra `http://localhost:5173`

## 5) Execução CLI

```bash
source venv/bin/activate
python main.py
```

## 6) Variáveis de ambiente opcionais

Crie um arquivo `.env` na raiz:

```bash
FLASK_DEBUG=False
SECRET_KEY=troque-esta-chave
PORT=5000
MAX_FILE_SIZE=10
RATE_LIMIT_STORAGE=memory://
TOTVS_COOKIE=
TOTVS_QUADRO_URL=
TOTVS_PORTAL_REFERER=
TOTVS_LOGIN_URL=
TOTVS_DEFAULT_ALIAS=CorporeRM
```

## Problemas comuns

### `python3: command not found`

- instale Python no sistema e valide com `python3 --version`.

### `npm: command not found`

- instale Node.js + npm e valide com `node -v` e `npm -v`.

### Versão do Node incompatível

- use Node.js `20.19+` ou `22.12+`.

### Porta 5000 ou 5173 já em uso

- finalize processos existentes ou ajuste portas manualmente.

### Erro ao instalar dependências Python

- ative o ambiente virtual antes de rodar `pip install -r requirements.txt`.

## Próximos passos

- UI: [WEB_INTERFACE.md](WEB_INTERFACE.md)
- API: [API_REFERENCE.md](API_REFERENCE.md)
- importação: [GOOGLE_CALENDAR.md](GOOGLE_CALENDAR.md) e [THUNDERBIRD.md](THUNDERBIRD.md)
