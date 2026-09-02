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

### Porta 5173 em uso

```bash
VITE_PORT=5174 npm run dev
```

### Frontend não conecta na API

Não existe backend local: o Vite encaminha `/api` para produção.

Checklist:

- `curl https://calendar.scalpel.com.br/api/health.php` responde;
- `VITE_API_PROXY_TARGET` não está apontando para um destino que não existe;
- chamadas do frontend usam caminho relativo `/api/...`.

## Upload e Análise

### Arquivo rejeitado

Causas comuns:

- arquivo não termina com `.json`;
- JSON malformado;
- payload não contém `data.SHorarioAluno`.

Correções:

- baixe novamente o arquivo do portal;
- valide se o JSON abre em um editor.

O arquivo é lido no próprio navegador: ele não sobe para servidor nenhum e não
há limite de tamanho imposto pela aplicação.

### Estatísticas mostram muitos inválidos

O analisador considera registro válido quando há pelo menos `NOME` e `DATAINICIAL`. Registros sem esses campos entram em `invalid_entries`.

## TOTVS

### Login retorna `400` com mensagem do portal

Causas comuns:

- usuário ou senha incorretos;
- portal exige fluxo adicional não coberto;
- alias/contexto incompatível.

Correções:

- teste login diretamente no Portal do Aluno;
- tente informar `alias` no body de `/api/totvs-login.php`;
- confira a constante `TOTVS_ALIAS` em `deploy/api/_lib.php`.

### Requisição retorna `429`

O limite é de 5 requisições por minuto por IP em cada endpoint. Espere um
minuto e tente de novo.

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
- aumente `TOTVS_TIMEOUT` em `deploy/api/_lib.php` temporariamente;
- confirme as constantes de URL no mesmo arquivo.

### Portal devolve uma página de erro em vez do formulário

Se a resposta trouxer `ErrorPage` e `FormatException`, o User-Agent enviado é o
culpado: o RM passa o UA pelo browser caps do ASP.NET e quebra com valores no
formato `Mozilla/5.0 (compatible; ...)`. Mantenha em `TOTVS_UA` um User-Agent
de navegador real.

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

### Deploy publicou o build mas o app some depois

Sintoma: o docroot fica só com `api/` e `.htaccess`.

Causa: algum `rsync --delete` da camada de servidor rodando sobre o docroot
inteiro. O `deploy.sh` do Scalpel evita isso excluindo do `--delete` do
estático tudo o que vem de `deploy/`, e sincronizando cada item de `deploy/`
separadamente.

### `403` em um endpoint da API

`_lib.php` é bloqueado de propósito pelo `.htaccess`: ele só é incluído pelos
outros arquivos. Se outro endpoint der 403, confira se ele não caiu dentro
desse bloco.

## Antes de Abrir Issue

Cole no relatório:

- comando executado;
- versão de Node e npm;
- ambiente (`dev` ou produção);
- mensagem de erro completa;
- endpoint chamado, se for API;
- se envolve TOTVS, informe se login direto no portal funciona, mas nunca cole senha ou cookie público.
