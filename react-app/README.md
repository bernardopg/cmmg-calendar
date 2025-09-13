# CMMG Calendar Analyzer (Frontend)

Frontend em React (Vite) para analisar o arquivo QuadroHorarioAluno.json.

- Upload por botão ou arrastar e soltar
- Integração com backend Flask (`/api/analyze`) via proxy do Vite
- Health-check da API
- Visualização de estatísticas
- Exportação local para CSV (Google Calendar) e ICS (Thunderbird)

## Rodando localmente

1. Inicie o backend Flask na raiz do projeto (porta 5000):

- Python: execute `api_server.py`

2. Inicie o frontend (nesta pasta `react-app`):

- `npm install`
- `npm run dev`

3. Acesse <http://localhost:5173>

O Vite está configurado com proxy `/api` -> `http://localhost:5000`.
