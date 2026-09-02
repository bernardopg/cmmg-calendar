# Arquitetura

Este guia descreve a arquitetura atual do CMMG Calendar para manutenção técnica.

## Visão Geral

```text
Usuário
  |
  v
React SPA (react-app)  ──── análise, estatísticas, CSV e ICS acontecem aqui
  |
  | /api/totvs-login.php
  | /api/extract-analyze.php
  v
API PHP (deploy/api)   ──── só o salto de rede
  |
  v
Portal TOTVS Educacional
```

A SPA é estática. O PHP existe por um motivo só: o portal do TOTVS não envia
cabeçalhos CORS, então o navegador não consegue chamá-lo diretamente. Tudo o
que é lógica pura ficou no cliente.

Em desenvolvimento, o Vite serve a SPA e faz proxy de `/api` para produção
(`VITE_API_PROXY_TARGET` sobrescreve). Em produção, o LiteSpeed serve os
arquivos estáticos e executa os `.php` do mesmo docroot.

## Diretórios

```text
react-app/
  src/
    components/   # layout, UI, gráficos, resultados e upload
    hooks/        # estado da API, tema, upload e análise
    lib/          # analyzeSchedule.ts + testes (funções puras)
    pages/        # rotas da SPA
    types/        # tipos usados no frontend
    utils/        # exportação CSV/ICS e utilitários
deploy/
  api/            # _lib.php, health.php, totvs-login.php, extract-analyze.php
  .htaccess       # fallback de rota da SPA, headers, cache
scalpel-app.sh    # manifesto lido por ../../deploy/deploy.sh
```

## Frontend

Rotas principais:

| Rota | Componente | Descrição |
| --- | --- | --- |
| `/` | `LandingPage` | Página inicial. |
| `/gerador` | `HomePage` | Fluxos de login, cookie, upload, análise e exportação. |
| `/guia` | `GuidePage` | Ajuda dentro da aplicação. |
| `/faq` | `FaqPage` | Perguntas frequentes. |
| `/sobre` | `AboutPage` | Contexto do projeto. |

Hooks importantes:

- `useApiHealth`: monitora `/api/health.php`.
- `useFileUpload`: valida arquivo `.json` e o formato mínimo `data.SHorarioAluno`.
- `useScheduleAnalysis`: analisa localmente no upload; nas consultas ao TOTVS,
  chama a API PHP e cancela requisições antigas com `AbortController`.
- `useToast`: feedback visual e limpeza de timers.

Análise e exportação:

- `lib/analyzeSchedule.ts`: `extractScheduleEntries` valida a estrutura e
  `analyzeScheduleDataJson` produz estatísticas, matérias, horários, locais,
  dias da semana e distribuição mensal. Funções puras, cobertas por
  `lib/analyzeSchedule.test.ts` (`node --test`, sem runner instalado).
- `utils/exportUtils.ts`: `exportToCSV` gera `GoogleAgenda.csv`; `exportToICS`
  gera `ThunderbirdAgenda.ics`.
- IDs vêm de utilitário seguro, sem fallback com `Math.random`.

## Backend PHP

| Rota | Arquivo | Responsabilidade |
| --- | --- | --- |
| `GET /api/health.php` | `health.php` | Status da API. |
| `POST /api/totvs-login.php` | `totvs-login.php` | Login no TOTVS e busca do horário. |
| `POST /api/extract-analyze.php` | `extract-analyze.php` | Busca do horário com cookie de sessão. |

`_lib.php` concentra tudo: constantes do portal, respostas JSON, rate limit por
IP em arquivo, a classe `TotvsSession` e os parsers. Não é endpoint — o
`.htaccess` responde 403 no acesso direto.

O fluxo de login reproduz o do Portal do Aluno, em sete passos:

1. `GET` na página de login e extração de `__VIEWSTATE`,
   `__VIEWSTATEGENERATOR`, `__EVENTVALIDATION` e dos aliases disponíveis.
2. `POST` do formulário com usuário, senha e alias (padrão `CorporeRM`).
3. Leitura do `Location` do redirecionamento — sem segui-lo.
4. `GET` no portal para inicializar a sessão.
5. `GET` em `AutoLoginPortal?key=<chave do fragmento do Location>`.
6. Seleção do contexto acadêmico (`Contexto` e `Contexto/Selecao`).
7. `GET` em `QuadroHorarioAluno`.

Quatro detalhes que parecem arbitrários e não são:

- **User-Agent de browser real.** O RM passa o UA pelo browser caps do
  ASP.NET; um UA `Mozilla/5.0 (compatible; ...)` faz o portal devolver
  ErrorPage com `FormatException` em vez do formulário.
- **Cookies em memória.** `TotvsSession` reaproveita um único handle de curl
  com `CURLOPT_COOKIEFILE => ''`; cookie jar em arquivo não preserva o
  `.ASPXAUTH`, que é cookie de sessão.
- **Sem seguir redirecionamento.** `CURLOPT_FOLLOWLOCATION => false`, porque a
  chave do portal está no fragmento do `Location`.
- **Cookie sem quebra de linha.** `extract-analyze.php` recusa `\r` e `\n`
  para não permitir injeção de cabeçalho.

## Deploy

Publicado por `../../deploy/deploy.sh calendar`, que builda o frontend, envia
`react-app/dist/` para o docroot do subdomínio e aplica `deploy/` por cima.
Detalhes em [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md).

## CI

O workflow usa Node 24 e tem um job só, `frontend`: instala dependências,
roda lint, `tsc --noEmit`, testes e build do Vite.

## Decisões Relevantes

- **Nenhum processo persistente.** A hospedagem compartilhada não roda Node
  como serviço, então análise e exportação foram para o navegador e o servidor
  ficou reduzido a PHP. O backend Fastify em `server/` foi removido.
- **Exportação client-side**, para o download ser imediato e não exigir
  endpoint extra.
- **Sem dependência nova para teste**: `node --test` roda TypeScript direto.
- O arquivo de upload nunca sai do navegador.

## Relacionados

- [Manual do Projeto](../../DOCUMENTACAO.md)
- [Referência da API](API_REFERENCE.md)
- [Deploy](DEPLOY_HOSTINGER.md)
