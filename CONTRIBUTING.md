# Guia de Contribuição

Obrigado por considerar contribuir com o CMMG Calendar Analyzer.

## Como contribuir

1. Faça um fork do projeto.
2. Crie uma branch descritiva:

```bash
git checkout -b feat/minha-melhoria
```

1. Implemente mudanças pequenas e focadas.
2. Atualize documentação quando necessário.
3. Abra Pull Request com descrição clara.

## Padrões esperados

- preserve estilo de código existente;
- não inclua mudanças não relacionadas ao escopo;
- prefira correções de causa-raiz;
- mantenha mensagens de commit objetivas.

## Backend (Python)

- instalar dependências via `requirements.txt`;
- validar execução da API (`python api_server.py`);
- quando aplicável, testar endpoint com `test_export_endpoints.py`.

## Frontend (React)

```bash
cd react-app
npm run lint
npm run build
```

## Pull Request checklist

- [ ] O problema foi descrito claramente
- [ ] A solução está focada no escopo
- [ ] A documentação foi atualizada
- [ ] Não foram introduzidos arquivos/links quebrados

## Código de conduta

Ao contribuir, siga [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Dúvidas

Abra uma issue ou entre em contato pelos canais em [CREDITS.md](CREDITS.md).
