# Instalação e Ambiente Local

Este guia cobre o ambiente local do CMMG Calendar: instalação, execução, build,
variáveis de ambiente e validação básica.

## Requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js | `^22.12.0` ou `>=24.0.0` |
| npm | `>=10` |
| Git | qualquer versão recente |

Valide antes de instalar:

```bash
node -v
npm -v
```

## Instalação

```bash
git clone https://github.com/bernardopg/cmmg-calendar.git
cd cmmg-calendar
npm install
```

O `postinstall` da raiz executa `npm install` em `react-app/`. Se precisar
reinstalar manualmente:

```bash
npm run install:all
```

## Desenvolvimento

```bash
npm run dev        # Vite em http://localhost:5173
```

**Não existe backend local.** A API são três arquivos PHP publicados em
produção; o Vite encaminha `/api` para lá. Isso significa que os fluxos de
login e cookie funcionam em desenvolvimento, batendo na API de produção, e o
fluxo de upload funciona inteiro no navegador, sem rede.

Para desenvolver a API PHP, edite `deploy/api/` e publique com
`../../deploy/deploy.sh calendar` (veja [Deploy](DEPLOY_HOSTINGER.md)). Se
quiser um PHP local, `php -S localhost:8000 -t deploy` serve os endpoints, e
aí basta apontar `VITE_API_PROXY_TARGET=http://localhost:8000`.

## Proxy do Frontend

Em desenvolvimento, o frontend chama `/api/...`. O Vite encaminha para:

```text
VITE_API_PROXY_TARGET
ou https://calendar.scalpel.com.br
```

Configurações úteis:

```bash
VITE_PORT=5173 npm run dev
VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev
```

## Build Local

```bash
npm run build
```

Saída gerada: `react-app/dist/`. Para servir o build:

```bash
npm run preview --prefix react-app
```

## Verificações de Qualidade

```bash
npm run lint
npm run test
npm run build
```

Ou tudo de uma vez:

```bash
npm run check
```

Os testes rodam com `node --test` sobre `react-app/src/lib/*.test.ts`, sem
nenhum runner instalado. O `tsc --noEmit` do build ignora os arquivos de teste,
que usam APIs de Node e não fazem parte do bundle do navegador.

## Variáveis de Ambiente

Só existem variáveis do frontend, e todas são opcionais:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_PORT` | `5173` | Porta do servidor de desenvolvimento. |
| `VITE_HOST` | todas as interfaces | Host do servidor de desenvolvimento. |
| `VITE_API_PROXY_TARGET` | `https://calendar.scalpel.com.br` | Destino do proxy de `/api`. |

As constantes do TOTVS (URLs, timeout, alias padrão) ficam no topo de
`deploy/api/_lib.php`. Não há `.env` de backend nem configuração de CORS: a SPA
e a API são servidas pela mesma origem.

## Deploy

O app é publicado pelo script do hub Scalpel:

```bash
../../deploy/deploy.sh calendar
```

Detalhes em [Deploy](DEPLOY_HOSTINGER.md).

## Próximos Passos

- [Interface Web](WEB_INTERFACE.md)
- [Referência da API](API_REFERENCE.md)
- [Deploy](DEPLOY_HOSTINGER.md)
- [Solução de Problemas](TROUBLESHOOTING.md)
