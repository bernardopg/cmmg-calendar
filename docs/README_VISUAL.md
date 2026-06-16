# Padrão Visual da Documentação

Este arquivo define como capturas de tela e imagens devem ser organizadas quando forem adicionadas à documentação.

## Objetivo

Manter imagens úteis, consistentes e seguras. Uma boa imagem deve explicar uma etapa do fluxo sem expor dados pessoais.

## Estrutura Recomendada

```text
docs/images/
├── web/
├── google-calendar/
├── thunderbird/
└── architecture/
```

## Imagens Prioritárias

| Caminho sugerido | Conteúdo |
| --- | --- |
| `docs/images/web/landing.png` | Página inicial em desktop. |
| `docs/images/web/generator-login.png` | Fluxo de login TOTVS, sem credenciais reais. |
| `docs/images/web/analysis-results.png` | Resultado da análise com dados fictícios. |
| `docs/images/web/export-buttons.png` | Botões de exportação CSV/ICS. |
| `docs/images/google-calendar/import.png` | Tela de importação do Google Calendar. |
| `docs/images/thunderbird/import.png` | Tela de importação do Thunderbird. |

## Regras de Segurança

- Não incluir nome real, RA, senha, cookie, e-mail pessoal ou token.
- Não mostrar dados reais de turma se houver risco de exposição.
- Preferir dados fictícios ou borrados.
- Conferir screenshots antes de commit.

## Padrão de Captura

- Formato: PNG.
- Largura recomendada: 1280px ou maior.
- Tema consistente por guia.
- Zoom em 100%.
- Sem blur excessivo.
- Recorte limpo e foco na ação descrita.

## Texto Alternativo

Toda imagem adicionada em Markdown deve ter texto alternativo útil, descrevendo a tela e a ação retratada. Evite alt text genérico como `imagem`, `screenshot` ou `print`.

## Checklist Para PRs Com Imagens

- [ ] Imagem não contém dados sensíveis.
- [ ] Nome do arquivo é descritivo.
- [ ] Markdown usa texto alternativo claro.
- [ ] A imagem corresponde ao texto do guia.
- [ ] O arquivo foi otimizado para web.
