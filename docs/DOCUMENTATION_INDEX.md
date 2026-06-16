# Índice da Documentação

Use este arquivo como mapa de navegação. A documentação está organizada por objetivo: começar rápido, operar localmente, integrar com a API, entender a arquitetura ou resolver problemas.

## Leitura Recomendada

| Se você quer... | Leia |
| --- | --- |
| Entender o projeto em poucos minutos | [README](../README.md) |
| Ter a visão completa do produto e da manutenção | [Manual do Projeto](../DOCUMENTACAO.md) |
| Rodar o projeto localmente | [Instalação](guides/INSTALLATION.md) |
| Usar a aplicação web | [Interface Web](guides/WEB_INTERFACE.md) |
| Integrar com endpoints HTTP | [Referência da API](guides/API_REFERENCE.md) |
| Usar comandos no terminal | [CLI](guides/CLI.md) |
| Entender módulos, fluxos e deploy | [Arquitetura](guides/ARCHITECTURE.md) |
| Corrigir erros comuns | [Solução de Problemas](guides/TROUBLESHOOTING.md) |

## Guias de Uso Final

- [Interface Web](guides/WEB_INTERFACE.md)
- [Google Calendar](guides/GOOGLE_CALENDAR.md)
- [Thunderbird e iCalendar](guides/THUNDERBIRD.md)

## Guias Técnicos

- [Instalação](guides/INSTALLATION.md)
- [Referência da API](guides/API_REFERENCE.md)
- [CLI](guides/CLI.md)
- [Arquitetura](guides/ARCHITECTURE.md)
- [Status da Migração](guides/MIGRATION_STATUS.md)
- [Solução de Problemas](guides/TROUBLESHOOTING.md)

## Governança

- [Contribuição](../CONTRIBUTING.md)
- [Segurança](../SECURITY.md)
- [Código de Conduta](../CODE_OF_CONDUCT.md)
- [Créditos](../CREDITS.md)
- [Licença](../LICENSE)

## Materiais Visuais

- [Padrão de imagens da documentação](README_VISUAL.md)

## Contexto Para Agentes

- [CLAUDE.md](../CLAUDE.md) contém contexto operacional para assistentes. Ele não substitui a documentação para humanos.

## Checklist Para Atualizar Documentação

Antes de fechar uma mudança que afeta comportamento, confira:

- `README.md` continua correto para novos usuários.
- `DOCUMENTACAO.md` reflete arquitetura, comandos e variáveis atuais.
- Guias em `docs/guides/` não citam rotas, comandos ou versões antigas.
- Exemplos de `curl` ainda batem com a API real.
- Links relativos funcionam a partir do arquivo onde aparecem.
