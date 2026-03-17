# CLAUDE.md

Este arquivo existe como contexto operacional para assistentes/agentes que trabalham neste repositório. Ele complementa a documentação principal, mas não a substitui.

## Estado atual

- Backend ativo: `server/`
- Frontend: `react-app/`

## Observações importantes

- Para uso humano, priorize `README.md`, `DOCUMENTACAO.md` e `docs/guides/*`.
- O backend canônico hoje é o app Node em `server/`.
- O frontend usa Vite, React, TypeScript e estilos CSS próprios do projeto.

## Comandos úteis

### Full stack

```bash
npm run dev
```

### Backend

```bash
npm run dev:server
npm run test --prefix server
npm run build --prefix server
```

### Frontend

```bash
npm run dev:client
npm run build --prefix react-app
```

## Variáveis de ambiente relevantes

- `PORT`
- `HOST`
- `MAX_FILE_SIZE_MB`
- `TOTVS_TIMEOUT_MS`
- `TOTVS_COOKIE`
- `TOTVS_QUADRO_URL`
- `TOTVS_PORTAL_REFERER`
- `TOTVS_LOGIN_URL`
- `TOTVS_AUTO_LOGIN_URL`
- `TOTVS_CONTEXT_URL`
- `TOTVS_CONTEXT_SELECTION_URL`
- `TOTVS_DEFAULT_ALIAS`
