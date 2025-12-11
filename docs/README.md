# Database / Prisma

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies:

```sh
pnpm install
```

## Migrate

Runs the Prisma migration history and generates the Prisma client:

```sh
pnpm prisma:migrate
```

## Seed

Seeds sample data (users, driver profile, vehicle, ride, payment, transactions, notifications, ratings):

```sh
pnpm prisma:seed
```

## Docs

- ERD: [`/docs/ERD.md`](./ERD.md)
- Data dictionary: [`/docs/data-dictionary.md`](./data-dictionary.md)
