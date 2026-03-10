# CLAUDE.md

Este arquivo existe como contexto operacional para assistentes/agentes que trabalham neste repositório. Ele complementa a documentação principal, mas não a substitui.

## Estado atual

- Backend ativo: `api_server.py`
- Frontend: `react-app/`
- CLI: `main.py`
- Refatoração modular do backend: `src/`

## Observações importantes

- Para uso humano, priorize `README.md`, `DOCUMENTACAO.md` e `docs/guides/*`.
- O backend canônico hoje é `api_server.py`.
- `src/` já possui smoke test e rota de análise/exportação, mas ainda representa a linha de refatoração.
- O frontend usa Vite, React, TypeScript e estilos CSS próprios do projeto.

## Comandos úteis

### Full stack

```bash
./start_app.sh
```

### Backend

```bash
./venv/bin/python api_server.py
./venv/bin/python test_export_endpoints.py
```

### Frontend

```bash
cd react-app
npm install
npm run dev
npm run lint
npm run build
```

## Variáveis de ambiente relevantes

- `FLASK_DEBUG`
- `SECRET_KEY`
- `PORT`
- `MAX_FILE_SIZE`
- `RATE_LIMIT_STORAGE`
- `TOTVS_COOKIE`
- `TOTVS_QUADRO_URL`
- `TOTVS_PORTAL_REFERER`
- `TOTVS_LOGIN_URL`
- `TOTVS_DEFAULT_ALIAS`
