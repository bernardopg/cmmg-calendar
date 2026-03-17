# Guia de Contribuição

Obrigado por considerar contribuir com o CMMG Calendar Analyzer.

## Como contribuir

1. Faça um fork do projeto.
2. Crie uma branch descritiva.
3. Implemente mudanças pequenas e focadas.
4. Atualize a documentação quando necessário.
5. Abra um Pull Request com descrição clara.

Exemplo:

```bash
git checkout -b feat/minha-melhoria
```

## Padrões esperados

- preserve o estilo de código existente
- não inclua mudanças fora do escopo
- prefira correções de causa-raiz
- mantenha mensagens de commit objetivas

## Backend

Fluxo principal:

```bash
npm install
npm run dev
npm run test
npm run build
```

## Frontend

Use `npm` como fluxo oficial do repositório.

```bash
npm run dev:client
npm run lint
npm run build --prefix react-app
```

## Checklist de Pull Request

- [ ] O problema foi descrito claramente
- [ ] A solução está focada no escopo
- [ ] A documentação foi atualizada
- [ ] Não foram introduzidos arquivos ou links quebrados

## Código de conduta

Ao contribuir, siga [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Dúvidas

Abra uma issue ou consulte os canais em [CREDITS.md](CREDITS.md).
