# Guia: Importar no Thunderbird

Este guia mostra a importação do arquivo `ThunderbirdAgenda.ics` gerado pelo projeto.

## Pré-requisitos

- arquivo `output/ThunderbirdAgenda.ics` gerado com sucesso;
- Mozilla Thunderbird instalado.

## Método recomendado (menu)

1. Abra o Thunderbird.
2. Vá para a aba de calendário.
3. Clique em **Arquivo > Importar**.
4. Selecione **Calendário**.
5. Escolha o arquivo `output/ThunderbirdAgenda.ics`.
6. Defina o calendário de destino.
7. Conclua a importação.

## Método alternativo (arrastar e soltar)

1. Abra a aba calendário no Thunderbird.
2. Arraste `output/ThunderbirdAgenda.ics` para dentro da interface.
3. Confirme o calendário de destino.

## Recomendações

- use o fuso `America/Sao_Paulo`;
- crie um calendário dedicado (ex.: `Aulas CMMG`);
- revise alguns eventos após importar.

## Problemas comuns

### Arquivo não abre/importa

- confira extensão `.ics`;
- gere novamente com `python main.py`.

### Eventos com horário incorreto

- valide o fuso no Thunderbird;
- confira os horários no JSON de origem.

### Eventos faltando

- entradas sem campos mínimos podem ser ignoradas no exportador;
- valide os dados de entrada.

## Próximo passo

- se quiser usar Google Calendar, veja [GOOGLE_CALENDAR.md](GOOGLE_CALENDAR.md).
