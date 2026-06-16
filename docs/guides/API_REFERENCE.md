# Referência da API

Base local: `http://localhost:5000/api`

Base em produção: `https://calendar.scalpel.com.br/api`

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

Os endpoints da aplicação não exigem autenticação própria. Os fluxos TOTVS dependem de credenciais do Portal do Aluno ou de um cookie de sessão válido.

## Segurança Aplicada pela API

- Rate limit por rota.
- Limite de upload configurável por `MAX_FILE_SIZE_MB`.
- Redação de `cookie`, `authorization`, `password` e `totvs_cookie` nos logs.
- Headers básicos: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e `X-DNS-Prefetch-Control`.
- CORS liberado em produção apenas via `CORS_ORIGINS`.

## `GET /api/health`

Verifica se a API está disponível.

Rate limit: `60` requisições por minuto.

Exemplo:

```bash
curl http://localhost:5000/api/health
```

Resposta `200`:

```json
{
  "status": "up",
  "message": "API funcionando",
  "port": 5000,
  "timestamp": "2026-06-16T14:32:28.691Z"
}
```

## `POST /api/analyze`

Analisa um arquivo `QuadroHorarioAluno.json` enviado por upload.

Content type: `multipart/form-data`

Campo obrigatório:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `file` | arquivo `.json` | Payload do TOTVS com `data.SHorarioAluno`. |

Rate limit: `10` requisições por minuto.

Exemplo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/api/analyze
```

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_entries": 120,
      "valid_entries": 118,
      "invalid_entries": 2
    },
    "subjects": {
      "Anatomia": 18
    },
    "time_slots": {
      "08:00:00 - 10:00:00": 12
    },
    "locations": {
      "Campus": 42
    },
    "days_of_week": {
      "Segunda": 20,
      "Terça": 20
    },
    "monthly_distribution": {
      "2026-03": 30
    }
  }
}
```

Erros comuns:

| Status | Quando ocorre |
| --- | --- |
| `400` | arquivo ausente, sem nome, extensão diferente de `.json` ou JSON inválido |
| `413` | arquivo maior que `MAX_FILE_SIZE_MB` |
| `422` | estrutura do JSON não contém dados processáveis |
| `429` | limite de taxa excedido |
| `500` | erro inesperado |

## `POST /api/extract-analyze`

Consulta o `QuadroHorarioAluno` no TOTVS usando cookie de sessão e devolve análise mais dados brutos.

Content type: `application/json`

Body:

```json
{
  "totvs_cookie": "ASP.NET_SessionId=...; .ASPXAUTH=..."
}
```

`totvs_cookie` é opcional no body se `TOTVS_COOKIE` estiver configurado no backend.

Rate limit: `5` requisições por minuto.

Exemplo:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"totvs_cookie":"ASP.NET_SessionId=...; .ASPXAUTH=..."}' \
  http://localhost:5000/api/extract-analyze
```

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "analysis": {
      "statistics": {
        "total_entries": 120,
        "valid_entries": 118,
        "invalid_entries": 2
      },
      "subjects": {},
      "time_slots": {},
      "locations": {},
      "days_of_week": {},
      "monthly_distribution": {}
    },
    "schedule_data": {
      "data": {
        "SHorarioAluno": []
      }
    }
  }
}
```

Erros comuns:

| Status | Quando ocorre |
| --- | --- |
| `400` | body inválido ou cookie ausente |
| `401` | cookie expirado ou não autorizado no TOTVS |
| `422` | TOTVS respondeu payload sem estrutura esperada |
| `429` | limite de taxa excedido |
| `502` | falha de conexão, HTTP inesperado ou JSON inválido do TOTVS |
| `500` | erro inesperado |

## `POST /api/totvs-login`

Recebe credenciais do Portal do Aluno, autentica no TOTVS, seleciona contexto acadêmico, consulta o horário e devolve análise mais dados brutos.

Content type: `application/json`

Body:

```json
{
  "user": "seu-usuario",
  "password": "sua-senha",
  "alias": "CorporeRM"
}
```

Campos:

| Campo | Obrigatório | Descrição |
| --- | --- | --- |
| `user` | sim | Usuário, RA ou login do Portal do Aluno. |
| `password` | sim | Senha do Portal do Aluno. |
| `alias` | não | Alias TOTVS desejado; se ausente, usa `TOTVS_DEFAULT_ALIAS`. |

Rate limit: `5` requisições por minuto.

Exemplo:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user":"seu-usuario","password":"sua-senha"}' \
  http://localhost:5000/api/totvs-login
```

Resposta `200`: mesmo formato de `/api/extract-analyze`.

Erros comuns:

| Status | Quando ocorre |
| --- | --- |
| `400` | usuário ou senha ausentes, body inválido ou contexto inválido |
| `401` | credenciais inválidas ou não autorizadas |
| `422` | payload TOTVS sem estrutura esperada |
| `429` | limite de taxa excedido |
| `502` | falha de conexão, HTTP inesperado ou JSON inválido do TOTVS |
| `500` | erro inesperado |

## Formato de Entrada Esperado

```json
{
  "data": {
    "SHorarioAluno": [
      {
        "NOME": "Anatomia",
        "DATAINICIAL": "2026-03-10T00:00:00",
        "DATAFINAL": "2026-03-10T00:00:00",
        "HORAINICIAL": "08:00:00",
        "HORAFINAL": "10:00:00",
        "DIASEMANA": "2",
        "PREDIO": "Campus",
        "BLOCO": "A",
        "SALA": "101",
        "CODTURMA": "MED01",
        "CODSUBTURMA": "A",
        "NOMEREDUZIDO": "ANA",
        "URLAULAONLINE": "https://exemplo.invalid/aula"
      }
    ]
  }
}
```

## Integração Recomendada

- Use chamadas relativas (`/api/...`) quando o frontend estiver no mesmo domínio da API.
- Trate explicitamente `400`, `401`, `413`, `422`, `429`, `500` e `502`.
- Não persista senha ou cookie TOTVS no cliente.
- Use `AbortController` ou timeout no cliente para evitar requisições penduradas.
- Mostre as mensagens de `error` retornadas pela API; elas já são pensadas para usuário final.

## Exportação

A API HTTP não possui endpoint de exportação. Na interface web, CSV e ICS são gerados no navegador por `react-app/src/utils/exportUtils.ts`. Para exportação no terminal, use a CLI documentada em [CLI.md](CLI.md).
