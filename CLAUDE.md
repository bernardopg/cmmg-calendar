# CLAUDE.md

Contexto operacional para agentes que trabalham neste repositório.

Este app faz parte do **Scalpel** (`scalpel.com.br`). Leia
[`../../AGENTS.md`](../../AGENTS.md) antes de mexer em deploy, hospedagem ou
sessão — ele descreve as restrições da hospedagem compartilhada e o script de
publicação. Se o repositório estiver clonado fora do Scalpel, esse arquivo não
existe; as restrições estão resumidas abaixo.

## Estado atual

- **Não existe backend Node.** O app Fastify em `server/` foi removido em
  setembro de 2026. Não ressuscite: a hospedagem não roda processo persistente.
- Frontend: `react-app/` (React 19, Vite 8, TypeScript 6).
- Backend: três arquivos PHP em `deploy/api/`, publicados junto com o build.
- Produção: <https://calendar.scalpel.com.br> (app público, sem login).

## Divisão de responsabilidade

| O quê | Onde roda |
| --- | --- |
| Análise do JSON, estatísticas | Browser — `react-app/src/lib/analyzeSchedule.ts` |
| Export CSV/ICS | Browser — `react-app/src/utils/exportUtils.ts` |
| Login e consulta ao TOTVS | PHP — `deploy/api/` (só porque o portal não tem CORS) |

Regra: lógica pura vai para o browser. PHP só entra onde é inevitável.

## Comandos

```bash
npm run dev      # Vite em :5173
npm run test     # node --test em react-app/src/lib
npm run lint
npm run build    # tsc --noEmit && vite build
npm run check    # lint + test + build
```

O proxy `/api` do Vite aponta para produção (`https://calendar.scalpel.com.br`),
já que não há backend local. Sobrescreva com `VITE_API_PROXY_TARGET`.

## Deploy

Pelo repositório do hub: `../../deploy/deploy.sh calendar`. Ele builda,
publica `react-app/dist/` no docroot do subdomínio e aplica `deploy/`
(`api/*.php` + `.htaccess`) por cima.

## Cuidados no código PHP

1. **User-Agent de browser real é obrigatório.** Um UA
   `Mozilla/5.0 (compatible; ...)` faz o RM devolver ErrorPage com
   `FormatException` em vez do formulário de login.
2. **Cookies em memória**: `TotvsSession` reaproveita o mesmo handle de curl
   com `CURLOPT_COOKIEFILE => ''`. Cookie jar em arquivo perde o `.ASPXAUTH`.
3. **`CURLOPT_FOLLOWLOCATION => false`**: a chave do portal vem no fragmento do
   `Location` do POST de login.
4. **A senha do TOTVS nunca é persistida** — nem em log, nem em disco.
   Mantenha o `error_log` de `totvs-login.php` sem o corpo da requisição.
5. `_lib.php` não é endpoint; o `.htaccess` bloqueia acesso direto.

## Variáveis de ambiente

Só do frontend, todas opcionais: `VITE_PORT`, `VITE_HOST`,
`VITE_API_PROXY_TARGET`. As constantes do TOTVS ficam no topo de
`deploy/api/_lib.php`.
