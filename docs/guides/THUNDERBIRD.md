# Importar ICS no Thunderbird e Outros Calendários

Use este guia para importar `ThunderbirdAgenda.ics`. O formato ICS é compatível com Thunderbird, Outlook, Apple Calendar, Google Calendar e vários clientes de calendário.

## Antes de Começar

Você precisa de:

- arquivo `ThunderbirdAgenda.ics` gerado pela interface web ou pela CLI;
- Thunderbird ou outro app compatível com iCalendar;
- calendário de destino criado, preferencialmente separado para as aulas.

## Gerar o Arquivo

Pela interface web:

1. Acesse `/gerador`.
2. Faça login no TOTVS, use cookie ou envie o JSON manualmente.
3. Aguarde a análise.
4. Clique em exportar ICS.

Pela CLI:

```bash
npm run schedule:export -- --input data/QuadroHorarioAluno.json
```

Arquivo gerado:

```text
output/ThunderbirdAgenda.ics
```

## Importar no Thunderbird

1. Abra o Thunderbird.
2. Acesse a área de calendário.
3. Selecione `Arquivo > Importar`.
4. Escolha a opção de calendário.
5. Selecione `ThunderbirdAgenda.ics`.
6. Escolha o calendário de destino.
7. Conclua a importação.
8. Revise alguns eventos.

Alternativa: arraste o arquivo `.ics` para a área de calendário e confirme a importação.

## Importar em Outros Apps

| App | Caminho comum |
| --- | --- |
| Outlook | `Arquivo > Abrir e Exportar > Importar/Exportar` |
| Apple Calendar | `Arquivo > Importar` |
| Google Calendar | `Configurações > Importar e exportar` |

Os nomes dos menus podem variar conforme versão e sistema operacional.

## Campos Exportados

| Campo ICS | Origem |
| --- | --- |
| `UID` | ID único gerado no momento da exportação |
| `DTSTAMP` | data/hora da geração do arquivo |
| `DTSTART` | `DATAINICIAL` + `HORAINICIAL` |
| `DTEND` | `DATAFINAL` ou `DATAINICIAL` + `HORAFINAL` |
| `SUMMARY` | `NOME` |
| `DESCRIPTION` | turma, subturma, código e aula online |
| `LOCATION` | prédio, bloco e sala |

## Recomendações

- Use fuso `America/Sao_Paulo` no calendário de destino.
- Importe em calendário dedicado para facilitar reimportações.
- Revise eventos em semanas diferentes após importar.
- Se precisar compartilhar o horário com outro app, prefira ICS.

## Problemas Comuns

### Arquivo não importa

Correções:

- confirme que o arquivo termina em `.ics`;
- gere o arquivo novamente;
- teste importar em um calendário vazio.

### Horário deslocado

Correções:

- confira fuso do app;
- confirme horários no JSON original;
- revise se o app interpreta eventos sem timezone explícito de forma diferente.

### Eventos faltando

O exportador ignora entradas sem `NOME`, `DATAINICIAL`, `HORAINICIAL` ou `HORAFINAL`, e também ignora datas inválidas.

## Relacionados

- [Interface Web](WEB_INTERFACE.md)
- [CLI](CLI.md)
- [Google Calendar](GOOGLE_CALENDAR.md)
