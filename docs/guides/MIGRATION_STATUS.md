# Status da Migração

A migração do backend Flask/Python para Node.js foi concluída. Este arquivo permanece como registro histórico para evitar dúvidas sobre qual stack é canônica.

## Estado Atual

| Área | Status |
| --- | --- |
| Backend canônico | `server/` com Fastify + TypeScript |
| Frontend canônico | `react-app/` com React + Vite + TypeScript |
| API ativa | `/api/health`, `/api/analyze`, `/api/extract-analyze`, `/api/totvs-login` |
| CLI ativa | comandos Node em `server/src/cli/` |
| Testes ativos | Node Test Runner em `server/src/**/*.test.ts` |
| CI ativa | GitHub Actions com Node 24 |
| Deploy principal | Docker Node 24 no DigitalOcean App Platform |

## O Que Não É Mais Canônico

- Backend Python/Flask.
- Dependências Python para execução principal.
- Scripts antigos de migração como fonte de verdade.

## Onde Consultar a Fonte de Verdade

- [Manual do Projeto](../../DOCUMENTACAO.md)
- [Arquitetura](ARCHITECTURE.md)
- [Instalação](INSTALLATION.md)
- [Referência da API](API_REFERENCE.md)

## Implicação Para Novas Mudanças

Novas features, correções e documentação devem considerar `server/` e `react-app/` como base. Se algum documento ou comentário mencionar Flask/Python como runtime atual, trate como informação desatualizada.
