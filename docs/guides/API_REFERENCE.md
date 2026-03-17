# Referência da API

Base URL local do backend: `http://localhost:5000/api`

Em produção, a expectativa é servir a API no mesmo domínio da SPA, por exemplo `https://scalpel.com.br/api`.

## Autenticação

Os endpoints locais não exigem autenticação própria da aplicação. Os fluxos TOTVS dependem de credenciais do portal ou de um cookie de sessão válido.

## Endpoints

### `GET /api/health`

Verifica disponibilidade da API.

Resposta `200`:

```json
{
  "status": "up",
  "message": "API funcionando",
  "port": 5000,
  "timestamp": "2026-03-17T14:32:28.691Z"
}
```

---

### `POST /api/analyze`

Analisa um arquivo de horário acadêmico enviado em `multipart/form-data`.

- Campo obrigatório: `file` (`.json`)
- Limite de taxa: `10 por minuto`

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
      "total_entries": 677,
      "valid_entries": 670,
      "invalid_entries": 7
    },
    "subjects": {},
    "time_slots": {},
    "locations": {},
    "days_of_week": {},
    "monthly_distribution": {}
  }
}
```

Erros comuns:

- `400`: arquivo ausente, extensão inválida ou JSON inválido
- `413`: arquivo acima do tamanho máximo
- `429`: limite de taxa excedido
- `500`: erro interno

---

### `POST /api/extract-analyze`

Busca o `QuadroHorarioAluno` no TOTVS usando um cookie de sessão já autenticado e devolve os dados brutos mais a análise consolidada.

- Body JSON opcional: `{"totvs_cookie":"ASP.NET_SessionId=...; .ASPXAUTH=..."}`
- Se `totvs_cookie` não for enviado, a API tenta `TOTVS_COOKIE` no ambiente
- Limite de taxa: `5 por minuto`

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
        "total_entries": 677,
        "valid_entries": 670,
        "invalid_entries": 7
      }
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

- `400`: cookie ausente
- `401`: sessão TOTVS inválida ou expirada
- `502`: falha de conexão ou resposta inválida do TOTVS

---

### `POST /api/totvs-login`

Recebe credenciais do Portal do Aluno, faz login no TOTVS, busca o horário e devolve análise mais dados brutos.

- Body JSON obrigatório: `{"user":"...","password":"..."}`
- Limite de taxa: `5 por minuto`

Exemplo:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user":"seu-usuario","password":"sua-senha"}' \
  http://localhost:5000/api/totvs-login
```

Erros comuns:

- `400`: usuário ou senha ausentes
- `401`: credenciais inválidas
- `502`: falha ao consultar TOTVS

---

## Exportação

Na arquitetura Node atual, a exportação CSV e ICS da interface é client-side e não passa pela API.

Arquivos relevantes:

- `react-app/src/utils/exportUtils.ts`
- `react-app/src/components/results/ExportButtons.tsx`

Observação:

- os endpoints `/export/csv` e `/export/ics` seguem existindo apenas no backend Python legado para compatibilidade antiga e não fazem parte do app Node de deploy.
- a referência histórica desse stack foi movida para `legacy/python/`

## Formato esperado do JSON

```json
{
  "data": {
    "SHorarioAluno": [
      {
        "NOME": "Matemática",
        "DATAINICIAL": "2025-03-10T00:00:00",
        "DATAFINAL": "2025-03-10T00:00:00",
        "HORAINICIAL": "08:00:00",
        "HORAFINAL": "10:00:00",
        "PREDIO": "Campus",
        "BLOCO": "A",
        "SALA": "101",
        "CODTURMA": "MAT01",
        "DIASEMANA": "1"
      }
    ]
  }
}
```

## Boas práticas de integração

- valide o JSON antes do envio
- trate `400`, `401`, `413`, `429`, `500` e `502`
- use timeout de rede no cliente
- não persista credenciais TOTVS desnecessariamente
- no frontend web, prefira sempre chamadas relativas como `fetch('/api/...')`
