# Solução de Problemas

Este guia reúne problemas frequentes em desenvolvimento, uso da interface, integração TOTVS, exportação e deploy.

## Instalação

### Versão do Node incompatível

Sintoma:

```text
Unsupported engine
```

Correção:

```bash
node -v
```

Use Node.js `^22.12.0` ou `>=24.0.0`.

### Dependências inconsistentes

Sintoma:

- erros estranhos após atualização de branch;
- pacote não encontrado;
- lockfile fora de sincronia.

Correção:

```bash
npm install
npm run install:all
```

Se for ambiente de CI ou build limpo, use `npm ci` nos pacotes relevantes.

## Desenvolvimento Local

### Porta 5000 ou 5173 em uso

Correção rápida:

```bash
PORT=5001 npm run dev:server
SERVER_PORT=5001 npm run dev:client
```

Ou configure:

```bash
VITE_PORT=5174 npm run dev:client
```

### Frontend não conecta na API

Checklist:

- backend está rodando com `npm run dev:server`;
- `curl http://localhost:5000/api/health` responde;
- Vite está usando a porta correta em `SERVER_PORT`, `API_PORT`, `PORT` ou `VITE_API_PROXY_TARGET`;
- chamadas do frontend usam caminho relativo `/api/...`.

## Upload e Análise

### Arquivo rejeitado

Causas comuns:

- arquivo não termina com `.json`;
- JSON malformado;
- payload não contém `data.SHorarioAluno`;
- arquivo excede `MAX_FILE_SIZE_MB`.

Correções:

- baixe novamente o arquivo do portal;
- valide se o JSON abre em um editor;
- aumente `MAX_FILE_SIZE_MB` apenas se realmente necessário.

### Estatísticas mostram muitos inválidos

O analisador considera registro válido quando há pelo menos `NOME` e `DATAINICIAL`. Registros sem esses campos entram em `invalid_entries`.

## TOTVS

### Login retorna `401`

Causas comuns:

- usuário ou senha incorretos;
- portal exige fluxo adicional não coberto;
- alias/contexto incompatível.

Correções:

- teste login diretamente no Portal do Aluno;
- tente informar `alias` no body de `/api/totvs-login`;
- confira `TOTVS_DEFAULT_ALIAS`.

### Cookie retorna `401`

Causas comuns:

- cookie expirado;
- cookie copiado incompleto;
- sessão pertence a outro contexto.

Correção:

- faça login novamente no portal e copie o header `Cookie` completo.

### Erro `502` ao consultar TOTVS

Causas comuns:

- portal indisponível;
- timeout;
- endpoint TOTVS alterado;
- resposta não veio em JSON.

Correções:

- tente novamente depois;
- aumente `TOTVS_TIMEOUT_MS` temporariamente;
- confirme `TOTVS_BASE_URL` e URLs específicas se foram sobrescritas.

## Exportação e Importação

### Google Calendar rejeita CSV

Correções:

- gere novamente `GoogleAgenda.csv`;
- importe pelo Google Calendar no navegador;
- confirme que o arquivo não foi aberto e salvo por editor que altere delimitadores.

### Eventos aparecem duplicados

O CMMG Calendar não remove eventos antigos do seu calendário. Crie um calendário dedicado para as aulas e apague-o antes de reimportar.

### Horários parecem deslocados

Correções:

- confira o fuso do calendário de destino;
- use `America/Sao_Paulo`;
- confira `HORAINICIAL` e `HORAFINAL` no JSON original.

## Build e Deploy

### `npm run build` falha no frontend

Execute os checks específicos:

```bash
npm run lint --prefix react-app
npm exec --prefix react-app -- tsc --noEmit
npm run build --prefix react-app
```

Observação: se usar `npx tsc`, execute dentro de `react-app` ou use o script do CI como referência.

### `npm run build` falha no backend

```bash
npm run test --prefix server
npm run build --prefix server
```

### Produção mostra `Frontend build não encontrado`

Causa: `react-app/dist` não existe no ambiente que iniciou o Fastify.

Correção:

```bash
npm run build
npm start
```

No Dockerfile, isso é feito automaticamente no estágio `builder`.

## Antes de Abrir Issue

Cole no relatório:

- comando executado;
- versão de Node e npm;
- ambiente (`dev`, Docker, produção);
- mensagem de erro completa;
- endpoint chamado, se for API;
- se envolve TOTVS, informe se login direto no portal funciona, mas nunca cole senha ou cookie público.
