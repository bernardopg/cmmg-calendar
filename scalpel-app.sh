# Manifesto lido por scalpel/deploy/deploy.sh. Caminhos relativos a este arquivo.
APP_SLUG="calendar"
APP_DOMAIN="calendar.scalpel.com.br"
APP_BUILD="npm run build --prefix react-app"
APP_DIST="react-app/dist"        # estático publicado no docroot do subdomínio
APP_SERVER="deploy"              # api/*.php + .htaccess, copiados por cima
