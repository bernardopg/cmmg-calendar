# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
FROM node:22.12-alpine AS builder

WORKDIR /app

# Copia manifests para aproveitar cache de camadas
COPY package*.json ./
COPY react-app/package*.json react-app/
COPY server/package*.json server/

# Instala TODAS as dependências (incluindo devDeps para o build)
RUN npm ci

# Copia fontes e constrói
COPY react-app/ react-app/
COPY server/ server/
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
FROM node:22.12-alpine AS runner

WORKDIR /app

# Só as dependências de produção do servidor
COPY --from=builder /app/server/package*.json server/
RUN npm ci --omit=dev --prefix server

# Artefatos compilados
COPY --from=builder /app/server/dist/ server/dist/
COPY --from=builder /app/react-app/dist/ react-app/dist/

# Ajusta permissões e roda como usuário não-root
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/dist/index.js"]
