# Guia de Contribuição

Obrigado por contribuir com o CMMG Calendar. Este projeto prioriza mudanças pequenas, verificáveis e bem documentadas.

## Stack Canônica

- Frontend: `react-app/`, React + Vite + TypeScript. É onde vive a análise.
- Backend: `deploy/api/`, três arquivos PHP que só fazem o salto autenticado ao
  TOTVS. Não existe backend Node — a hospedagem não roda processo persistente.
- Node: `^22.12.0` ou `>=24.0.0`.
- npm: `>=10`.

## Fluxo Recomendado

1. Atualize sua branch a partir de `main`.
2. Crie uma branch descritiva.
3. Faça uma mudança focada.
4. Atualize documentação quando comportamento, comandos, API ou ambiente mudarem.
5. Rode as verificações locais.
6. Abra um Pull Request com descrição objetiva.

Exemplo:

```bash
git switch main
git pull
git switch -c feat/minha-melhoria
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Sobe o Vite em `:5173`. As chamadas a `/api` vão para produção; sobrescreva com
`VITE_API_PROXY_TARGET`.

## Verificações Antes do PR

Rode tudo:

```bash
npm run check
```

Ou rode por partes:

```bash
npm run lint
npm run test
npm run build
```

Checks mais específicos:

```bash
npm run lint  --prefix react-app
npm run test  --prefix react-app
npm run build --prefix react-app
```

Mudou algo em `deploy/api/`? Rode `php -l` em cada arquivo alterado e descreva
no PR como testou contra o portal.

## Padrões de Código

- Preserve o estilo existente.
- Prefira mudanças pequenas e de causa-raiz.
- Evite refatorações sem relação com o problema.
- Não introduza fallback de compatibilidade sem necessidade concreta.
- Não persista credenciais, cookies TOTVS ou dados pessoais.
- Garanta mensagens de erro legíveis para usuário final.

## Documentação

Atualize documentação quando mudar:

- comandos npm;
- variáveis de ambiente;
- endpoints da API;
- formato de entrada ou saída;
- fluxo da interface;
- deploy, CI ou requisitos de versão.

Arquivos principais:

- `README.md`
- `DOCUMENTACAO.md`
- `docs/DOCUMENTATION_INDEX.md`
- guias em `docs/guides/`

## Checklist de Pull Request

- [ ] Escopo do problema está claro.
- [ ] Solução é pequena e focada.
- [ ] Testes ou justificativa de ausência estão descritos.
- [ ] Documentação foi atualizada quando necessário.
- [ ] Não há links, comandos ou rotas quebradas adicionadas.
- [ ] Não há segredos em código, logs, fixtures ou documentação.

## Segurança

Se encontrar vulnerabilidade, não abra issue pública com detalhes sensíveis. Siga [SECURITY.md](SECURITY.md).

## Código de Conduta

Ao contribuir, siga [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
