FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN pnpm install

COPY backend ./backend
COPY tsconfig.base.json ./

RUN pnpm --filter backend build

EXPOSE 3000

CMD ["pnpm", "--filter", "backend", "start"]
