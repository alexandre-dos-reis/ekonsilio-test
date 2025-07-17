FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm --filter db... install

CMD ["pnpm", "run", "db:push"]
