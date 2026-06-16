# Guia de Contribuição

Obrigado por contribuir com o CMMG Calendar. Este projeto prioriza mudanças pequenas, verificáveis e bem documentadas.

## Stack Canônica

- Backend: `server/`, Fastify + TypeScript.
- Frontend: `react-app/`, React + Vite + TypeScript.
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

Full stack:

```bash
npm run dev
```

Separado:

```bash
npm run dev:server
npm run dev:client
```

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
npm run test --prefix server
npm run build --prefix server
npm run lint --prefix react-app
npm run build --prefix react-app
```

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
