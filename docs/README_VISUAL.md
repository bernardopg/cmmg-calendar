# Guia Visual da Documentação

Este arquivo define padrão para capturas de tela e materiais visuais usados na documentação.

## Objetivo

Manter consistência visual e qualidade nas imagens de guias e README.

## Estrutura sugerida

```text
docs/images/
├── web/
├── google-calendar/
├── thunderbird/
└── branding/
```

## Imagens prioritárias

1. Tela inicial da aplicação web
2. Resultado da análise
3. Exportação CSV e ICS
4. Passos de importação no Google Calendar
5. Passos de importação no Thunderbird

## Padrão de captura

- resolução mínima: 1280x720;
- formato: PNG;
- sem dados pessoais ou sensíveis;
- idioma da interface consistente por guia;
- foco no fluxo da tarefa (evitar elementos irrelevantes).

## Convenção de nomes

- `web-home.png`
- `web-analysis-result.png`
- `google-import-step-1.png`
- `thunderbird-import-step-1.png`

## Checklist de qualidade

- texto legível em 100% de zoom;
- sem blur ou compressão agressiva;
- recorte limpo;
- passo retratado confere com o texto do guia;
- arquivo otimizado para web.

## Próximos passos

- adicionar as imagens em `docs/images/`;
- referenciar as imagens nos guias correspondentes;
- manter este padrão em novos PRs de documentação.
