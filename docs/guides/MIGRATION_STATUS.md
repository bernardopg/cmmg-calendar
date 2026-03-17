# Status da Migração

Resumo do estado atual da transição de Flask/Python para Node.js.

## Concluído

- backend principal em `server/` com Fastify + TypeScript
- rotas `/api/health`, `/api/analyze`, `/api/extract-analyze` e `/api/totvs-login`
- fluxo local com `npm run dev`, `npm run dev:server` e `npm run dev:client`
- build único com frontend em `react-app/dist` e backend em `server/dist`
- documentação principal atualizada para o fluxo Node
- stack Python antigo isolado em `legacy/python/`

## Mantido como legado

- backend Flask antigo
- CLI Python para exportação
- smoke tests Python dos endpoints de exportação
- utilitário Python para extração via cookie

## O que ainda falta migrar se o objetivo for remover Python por completo

- portar ou aposentar a CLI Python de exportação em `legacy/python/main.py`
- decidir se os endpoints legados `/export/csv` e `/export/ics` ainda precisam existir fora do frontend
- criar testes automatizados do backend Node para análise e fluxos TOTVS
- remover o diretório `legacy/python/` após um período de confiança, se ele deixar de ser necessário

## Observação

Hoje o deploy principal já pode ser feito apenas com Node.js. O Python não é mais requisito para a aplicação web atual.
