# Status da Migração

Registro histórico das mudanças de stack, para não restar dúvida sobre qual é a
canônica.

| Fase | Backend | Situação |
| --- | --- | --- |
| Inicial | Flask/Python | removido |
| Intermediária | Node.js + Fastify em `server/` | removido em setembro de 2026 |
| **Atual** | análise no navegador + 3 arquivos PHP em `deploy/api/` | canônica |

## Estado Atual

| Área | Status |
| --- | --- |
| Frontend canônico | `react-app/` com React + Vite + TypeScript |
| Análise e exportação | `react-app/src/lib/` e `react-app/src/utils/` (navegador) |
| API ativa | `/api/health.php`, `/api/totvs-login.php`, `/api/extract-analyze.php` |
| CLI | removida — os três fluxos existem no app web |
| Testes ativos | Node Test Runner em `react-app/src/lib/*.test.ts` |
| CI | GitHub Actions, job único de frontend |
| Produção | Hostinger compartilhado, em `calendar.scalpel.com.br` |

## Por que o backend Node saiu

A hospedagem contratada é CloudLinux + LiteSpeed + PHP. Não há CloudLinux
Node.js Selector, Passenger, `pm2` nem `crontab`, e o servidor web não faz
proxy para porta arbitrária: não existe forma de manter um processo Node no ar.
Como o backend só fazia análise (função pura) e um salto autenticado ao TOTVS,
a análise foi para o navegador e o salto virou PHP.

## Relacionados

- [Manual do Projeto](../../DOCUMENTACAO.md)
- [Arquitetura](ARCHITECTURE.md)
- [Deploy](DEPLOY_HOSTINGER.md)
