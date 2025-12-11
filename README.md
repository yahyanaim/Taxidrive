# Model Data Layer (PostgreSQL + Prisma)

This repository contains the foundational database schema, migrations, seed routine, and a thin data-access/service layer.

## Quickstart

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install deps:

```sh
pnpm install
```

3. Run migrations:

```sh
pnpm prisma:migrate
# or: pnpm prisma migrate dev
```

4. Seed sample data:

```sh
pnpm prisma:seed
# or: pnpm prisma db seed
```

## Docs

See `/docs`:

- [`docs/ERD.md`](./docs/ERD.md)
- [`docs/data-dictionary.md`](./docs/data-dictionary.md)
