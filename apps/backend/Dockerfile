FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install

RUN pnpm --filter backend run build

EXPOSE 3001

CMD ["node", "/app/apps/backend/dist/index.cjs"]
