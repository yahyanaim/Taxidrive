# TaxiDrive MVP (Monorepo)

This repository is a pnpm workspace with:

- `frontend/`: React + Vite + TypeScript
- `backend/`: Node.js + Express + TypeScript

## Prerequisites

- Node.js 20+
- pnpm (recommended via Corepack)

```bash
corepack enable
```

## Setup

```bash
pnpm install
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Development

Runs frontend + backend in watch mode:

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health

## Quality

```bash
pnpm lint
pnpm test
pnpm build
```

## Docker (backend + database)

Bring up Postgres + the backend service:

```bash
docker compose up --build
```
