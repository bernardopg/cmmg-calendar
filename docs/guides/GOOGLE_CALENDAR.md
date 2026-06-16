# Importar no Google Calendar

Use este guia para importar `GoogleAgenda.csv` no Google Calendar.

## Antes de Começar

Você precisa de:

- arquivo `GoogleAgenda.csv` gerado pela interface web ou pela CLI;
- conta Google;
- acesso a <https://calendar.google.com> pelo navegador.

Recomendação: crie um calendário dedicado para as aulas, por exemplo `Aulas CMMG`. Isso facilita apagar e reimportar sem misturar eventos pessoais.

## Gerar o Arquivo

Pela interface web:

1. Acesse `/gerador`.
2. Faça login no TOTVS, use cookie ou envie o JSON manualmente.
3. Aguarde a análise.
4. Clique em exportar CSV.

Pela CLI:

```bash
npm run schedule:export -- --input data/QuadroHorarioAluno.json
```

Arquivo gerado:

```text
output/GoogleAgenda.csv
```

## Importação Passo a Passo

1. Abra <https://calendar.google.com>.
2. Clique na engrenagem.
3. Acesse `Configurações`.
4. No menu lateral, abra `Importar e exportar`.
5. Em `Importar`, selecione `GoogleAgenda.csv`.
6. Escolha o calendário de destino.
7. Clique em `Importar`.
8. Revise alguns eventos para confirmar data, horário e local.

## Campos Exportados

| Campo Google | Origem no JSON |
| --- | --- |
| Subject | `NOME` |
| Start Date | `DATAINICIAL` |
| Start Time | `HORAINICIAL` |
| End Date | `DATAFINAL` ou `DATAINICIAL` |
| End Time | `HORAFINAL` |
| Description | `CODTURMA`, `CODSUBTURMA`, `NOMEREDUZIDO`, `URLAULAONLINE` |
| Location | `PREDIO`, `BLOCO`, `SALA` |

## Recomendações

- Use fuso `America/Sao_Paulo`.
- Importe primeiro em um calendário vazio.
- Revise eventos de dias diferentes antes de confiar no calendário completo.
- Guarde o CSV original até confirmar que a importação ficou correta.

## Problemas Comuns

### Eventos duplicados

O Google pode duplicar eventos se você importar o mesmo CSV mais de uma vez. Para reimportar, prefira apagar o calendário dedicado e criar outro.

### Google rejeita o arquivo

Possíveis causas:

- arquivo não termina em `.csv`;
- arquivo foi editado por planilha e teve delimitadores alterados;
- download foi interrompido.

Correção: gere novamente o CSV pela interface ou pela CLI.

### Datas ou horários incorretos

Confira:

- fuso do Google Calendar;
- campos `DATAINICIAL`, `DATAFINAL`, `HORAINICIAL` e `HORAFINAL` no JSON original;
- calendário de destino escolhido na importação.

### Eventos faltando

Entradas sem `NOME` ou sem `DATAINICIAL` são ignoradas. Se houver muitos eventos faltando, confira a qualidade do JSON exportado pelo portal.

## Relacionados

- [Interface Web](WEB_INTERFACE.md)
- [CLI](CLI.md)
- [Thunderbird e iCalendar](THUNDERBIRD.md)
