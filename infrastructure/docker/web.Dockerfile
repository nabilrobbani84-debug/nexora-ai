FROM node:22.18-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG NEXT_PUBLIC_WS_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @nexora/web build

FROM node:22.18-bookworm-slim AS runner

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app /app
USER node
EXPOSE 3000
CMD ["pnpm", "--filter", "@nexora/web", "start"]
