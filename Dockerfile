FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

ARG DATABASE_URL
ARG DIRECT_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

COPY package.json package-lock.json ./
COPY app/ app/
COPY src/ src/
COPY components/ components/
COPY hooks/ hooks/
COPY lib/ lib/
COPY public/ public/
COPY prisma/ prisma/
COPY types/ types/
COPY prisma.config.ts next.config.ts postcss.config.mjs tsconfig.json proxy.ts ./

RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
COPY --from=builder /app/prisma.config.ts /app/prisma.config.ts

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV NODE_ENV=production

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD ["curl", "-f", "http://localhost:3000/api/health"]

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
