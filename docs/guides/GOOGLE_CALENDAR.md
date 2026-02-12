# Guia: Importar no Google Calendar

Este guia mostra a importação do arquivo `GoogleAgenda.csv` gerado pelo projeto.

## Pré-requisitos

- arquivo `output/GoogleAgenda.csv` gerado com sucesso;
- conta Google ativa;
- acesso a <https://calendar.google.com>.

## Passo a passo

1. Abra o Google Calendar.
2. No menu esquerdo, em **Outros calendários**, clique em **+**.
3. Clique em **Importar**.
4. Em **Selecionar arquivo do computador**, escolha `output/GoogleAgenda.csv`.
5. Escolha o calendário de destino.
6. Clique em **Importar**.

## Recomendações

- crie um calendário dedicado (ex.: `Aulas CMMG`);
- ajuste o fuso para `America/Sao_Paulo`;
- revise 2-3 eventos importados para confirmar horário/local.

## Problemas comuns

### Google rejeita o arquivo

- confirme que o arquivo termina com `.csv`;
- gere novamente com `python main.py`.

### Datas/Horários incorretos

- confira o fuso da conta Google;
- valide se `DATAINICIAL`, `HORAINICIAL` e `HORAFINAL` vieram corretos no JSON de origem.

### Eventos faltando

- o exportador ignora entradas sem os campos mínimos (`NOME` e `DATAINICIAL`);
- valide a qualidade do arquivo JSON.

## Próximo passo

- se preferir ICS, use o guia [THUNDERBIRD.md](THUNDERBIRD.md).
