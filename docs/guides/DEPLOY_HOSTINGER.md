# Deploy na Hostinger

O CMMG Calendar é publicado como app do hub **Scalpel**, em
`calendar.scalpel.com.br`. Este guia descreve o que está no ar hoje.

## Restrição que define a arquitetura

A hospedagem é um plano compartilhado (CloudLinux + LiteSpeed + PHP 8.3). Não
há CloudLinux Node.js Selector, Passenger, `pm2` nem `crontab`, e o servidor web
não faz proxy para porta arbitrária: **não existe como manter um processo Node
no ar**. Por isso a análise foi para o navegador e restaram três arquivos PHP.

## O que vai para o servidor

```text
~/domains/scalpel.com.br/
├── private/config.php                  # config do hub, FORA do docroot
└── public_html/                        # docroot de scalpel.com.br (o hub)
    ├── index.php, login.php, ...
    └── calendar/                       # docroot de calendar.scalpel.com.br
        ├── index.html, assets/…        # react-app/dist
        ├── .htaccess                   # deploy/.htaccess
        └── api/                        # deploy/api
```

O docroot do subdomínio fica **dentro** do docroot do hub. O script de deploy
sabe disso e protege cada app no `rsync --delete` do hub.

## Publicar

Do repositório do Scalpel:

```bash
./deploy/deploy.sh calendar     # só este app
./deploy/deploy.sh              # hub + todos os apps
./deploy/deploy.sh --dry-run    # simula
```

O script:

1. roda `npm run build --prefix react-app`;
2. envia `react-app/dist/` para o docroot com `--delete`, preservando o que não
   vem do build (`api/` e `.htaccess`);
3. envia `deploy/api/` com `--delete` e o `deploy/.htaccess` por cima.

Acesso por `ssh hostinger-bebitter`; sobrescreva com `SCALPEL_SSH_HOST`.

## Pré-requisitos, uma vez só

- Subdomínio `calendar.scalpel.com.br` criado no hPanel com docroot
  `public_html/calendar`.
- Deploy automático do hPanel (`hbuilds`) **desativado**: ele fazia
  `git clone` + `npm build` sem passo de publicação e sobrescrevia o docroot.
- Chave SSH configurada como `hostinger-bebitter` no `~/.ssh/config`.

## Validar depois de publicar

```bash
C=https://calendar.scalpel.com.br

curl -s  "$C/api/health.php"                                   # {"status":"up",...}
curl -so /dev/null -w '%{http_code}\n' "$C/"                   # 200
curl -so /dev/null -w '%{http_code}\n' "$C/sobre"              # 200 (fallback da SPA)
curl -so /dev/null -w '%{http_code}\n' "$C/api/_lib.php"       # 403
curl -so /dev/null -w '%{http_code}\n' "$C/api/totvs-login.php" # 405 (GET)

curl -s -X POST -H 'Content-Type: application/json' -d '{}' \
  "$C/api/totvs-login.php"                                     # 400 com mensagem

for i in $(seq 1 6); do
  curl -so /dev/null -w "$i:%{http_code} " -X POST \
    -H 'Content-Type: application/json' -d '{"user":"x","password":"y"}' \
    "$C/api/totvs-login.php"
done; echo                                                     # a 6ª dá 429
```

No navegador: fazer um login real, conferir o horário e baixar CSV e ICS.

## Limitações conhecidas

- **App público.** A SPA é estática; fechá-la exigiria servir cada asset por
  PHP. Como nada é persistido (a senha do TOTVS é digitada a cada uso), ela fica
  aberta. Para exigir login do hub, basta acrescentar nos endpoints:
  `require __DIR__ . '/../../_boot.php'; if (!is_logged_in()) fail(401, 'Não autenticado.');`
- **Sem processo persistente**: nada de WebSocket, fila, worker ou cron.
- **Rate limit em arquivo** dentro de `/tmp`: some quando o CageFS limpa o
  diretório. Suficiente para um host só.

## Relacionados

- [Arquitetura](ARCHITECTURE.md)
- [Referência da API](API_REFERENCE.md)
