FROM node:24-alpine AS builder

WORKDIR /app
COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install
RUN pnpm --filter admin run build

FROM pierrezemb/gostatic:latest
COPY --from=builder /app/apps/admin/dist /srv/http
EXPOSE 8043
CMD [ "-fallback", "index.html" ]
