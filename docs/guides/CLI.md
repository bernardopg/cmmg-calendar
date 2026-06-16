# CLI

O projeto inclui utilitários de terminal no backend Node. Eles são úteis para automação, depuração e uso sem interface web.

Todos os comandos devem ser executados na raiz do repositório.

## Pré-requisitos

```bash
npm install
```

Opcionalmente, crie `.env` na raiz ou `server/.env` para variáveis TOTVS.

## Analisar JSON

Comando:

```bash
npm run schedule:analyze -- --input data/QuadroHorarioAluno.json
```

Se `--input` não for informado, o padrão é:

```text
data/QuadroHorarioAluno.json
```

Saída: JSON da análise impresso no terminal.

Exemplo de saída:

```json
{
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
}
```

## Exportar CSV e ICS

Comando:

```bash
npm run schedule:export -- --input data/QuadroHorarioAluno.json
```

Saída padrão:

```text
output/GoogleAgenda.csv
output/ThunderbirdAgenda.ics
```

Para escolher outro diretório:

```bash
npm run schedule:export -- \
  --input data/QuadroHorarioAluno.json \
  --output-dir output/semestre-2026-1
```

## Buscar Horário no TOTVS por Cookie

Comando com cookie explícito:

```bash
npm run totvs:fetch -- --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...'
```

Comando usando `TOTVS_COOKIE` do ambiente:

```bash
TOTVS_COOKIE='ASP.NET_SessionId=...; .ASPXAUTH=...' npm run totvs:fetch
```

Saída padrão:

```text
data/QuadroHorarioAluno.json
```

Para escolher outro arquivo:

```bash
npm run totvs:fetch -- \
  --cookie 'ASP.NET_SessionId=...; .ASPXAUTH=...' \
  --output data/meu-horario.json
```

## Segurança dos Caminhos

As CLIs validam os caminhos de entrada e saída para que permaneçam dentro da raiz do projeto. Caminhos absolutos fora do repositório e path traversal com `../` são rejeitados.

## Erros Comuns

| Erro | Causa provável | Correção |
| --- | --- | --- |
| `Arquivo não encontrado` | `--input` aponta para arquivo inexistente | confira o caminho dentro do projeto |
| `JSON inválido` | arquivo malformado | baixe ou gere o JSON novamente |
| `Cookie TOTVS ausente` | `--cookie` e `TOTVS_COOKIE` vazios | informe um cookie válido |
| `Acesso a caminho fora do projeto não é permitido` | caminho com `../` ou absoluto externo | use caminho relativo dentro do repo |

## Relacionados

- [Instalação](INSTALLATION.md)
- [Referência da API](API_REFERENCE.md)
- [Solução de Problemas](TROUBLESHOOTING.md)
