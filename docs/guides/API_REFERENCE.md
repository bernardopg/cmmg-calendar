# Referência da API

Base URL padrão: `http://localhost:5000`

## Autenticação

Atualmente os endpoints são públicos em ambiente local.

## Endpoints

### `GET /health`

Verifica disponibilidade da API.

Resposta `200`:

```json
{
  "status": "up",
  "message": "API funcionando"
}
```

---

### `POST /analyze`

Analisa o arquivo de horário acadêmico.

- Método: `multipart/form-data`
- Campo obrigatório: `file` (`.json`)
- Limite de taxa: `10 por minuto`

Exemplo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/analyze
```

Resposta `200` (resumo):

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

- `400`: arquivo ausente, tipo inválido ou JSON inválido
- `413`: arquivo acima do tamanho máximo configurado
- `500`: erro interno

---

### `POST /export/csv`

Gera CSV para Google Calendar.

Aceita:

1. `multipart/form-data` com campo `file`, ou
2. JSON no corpo (`application/json`).

- Limite de taxa: `5 por minuto`

Exemplo com arquivo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/export/csv \
  -o GoogleAgenda.csv
```

Exemplo com JSON no body:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @data/QuadroHorarioAluno.json \
  http://localhost:5000/export/csv \
  -o GoogleAgenda.csv
```

Resposta `200`:

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename=GoogleAgenda.csv`

---

### `POST /export/ics`

Gera ICS para Thunderbird e clientes iCalendar.

Aceita:

1. `multipart/form-data` com campo `file`, ou
2. JSON no corpo (`application/json`).

- Limite de taxa: `5 por minuto`

Exemplo com arquivo:

```bash
curl -X POST \
  -F "file=@data/QuadroHorarioAluno.json" \
  http://localhost:5000/export/ics \
  -o ThunderbirdAgenda.ics
```

Resposta `200`:

- `Content-Type: text/calendar; charset=utf-8`
- arquivo de download `ThunderbirdAgenda.ics`

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

- valide o JSON antes do envio;
- trate códigos `400`, `413`, `429` e `500`;
- implemente retentativa para falhas transitórias;
- use timeout de rede no cliente.
