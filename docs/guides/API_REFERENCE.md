# Referência da API

Base: `https://calendar.scalpel.com.br/api`

A API é composta por três arquivos PHP publicados junto com o build da SPA. Ela
existe por um motivo só: o Portal do Aluno do TOTVS não envia cabeçalhos CORS,
então o navegador não pode chamá-lo diretamente. Nada aqui analisa dado —
análise, estatísticas e exportação rodam no cliente.

## Convenções

Respostas de sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Respostas de erro:

```json
{
  "success": false,
  "error": "Mensagem legível para o usuário"
}
```

Os dois endpoints de dados aceitam **apenas `POST`** com corpo JSON; `GET`
responde `405`.

## Segurança Aplicada pela API

- Rate limit por IP: 5 requisições por minuto em cada endpoint de dados.
- Credenciais do TOTVS não são persistidas: nem em log, nem em sessão, nem em
  disco. O `error_log` nunca inclui o corpo da requisição.
- Cookie com `\r` ou `\n` é recusado (injeção de cabeçalho).
- `_lib.php` não é endpoint: acesso direto responde `403`.
- Headers em toda resposta: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `X-DNS-Prefetch-Control` e `Cache-Control: no-store`.
- Não há CORS: a SPA e a API são servidas pela mesma origem.

## `GET /api/health.php`

Verifica se a API está disponível.

```bash
curl https://calendar.scalpel.com.br/api/health.php
```

Resposta `200`:

```json
{
  "status": "up",
  "message": "API funcionando",
  "timestamp": "2026-09-02T22:24:00+00:00"
}
```

## `POST /api/totvs-login.php`

Autentica no Portal do Aluno e devolve o quadro de horários cru.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `user` | string | sim | Usuário do Portal do Aluno. |
| `password` | string | sim | Senha do Portal do Aluno. |
| `alias` | string | não | Alias do RM. Padrão: `CorporeRM`. |

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"user":"SEU_RA","password":"SUA_SENHA"}' \
  https://calendar.scalpel.com.br/api/totvs-login.php
```

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "schedule_data": {
      "data": { "SHorarioAluno": [] }
    }
  }
}
```

Erros:

| Status | Situação |
| --- | --- |
| `400` | Campos ausentes, credenciais inválidas ou erro devolvido pelo portal. |
| `405` | Método diferente de `POST`. |
| `429` | Mais de 5 requisições por minuto. |
| `500` | Falha inesperada. |

## `POST /api/extract-analyze.php`

Consulta o quadro de horários reaproveitando um cookie de sessão do TOTVS que
você já tem no navegador.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `totvs_cookie` | string | sim | Cookie de sessão ativo do portal. |

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"totvs_cookie":"ASP.NET_SessionId=...; .ASPXAUTH=..."}' \
  https://calendar.scalpel.com.br/api/extract-analyze.php
```

O formato da resposta é o mesmo de `totvs-login.php`.

Erros:

| Status | Situação |
| --- | --- |
| `400` | Cookie ausente, com quebra de linha, ou resposta inválida do portal. |
| `401` | Cookie expirado. |
| `405` | Método diferente de `POST`. |
| `429` | Mais de 5 requisições por minuto. |
| `502` | Falha de conexão com o portal. |

## O que saiu

`POST /api/analyze` não existe mais. O arquivo enviado por upload é lido e
analisado no próprio navegador, por `react-app/src/lib/analyzeSchedule.ts`, e
nunca sai da máquina do usuário.

## Relacionados

- [Arquitetura](ARCHITECTURE.md)
- [Deploy](DEPLOY_HOSTINGER.md)
- [Interface Web](WEB_INTERFACE.md)
