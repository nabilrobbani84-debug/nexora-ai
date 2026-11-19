FROM node:22.18-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @nexora/api build

FROM node:22.18-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app /app
USER node
EXPOSE 4000
CMD ["pnpm", "--filter", "@nexora/api", "start"]
