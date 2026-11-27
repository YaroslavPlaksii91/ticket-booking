# Ticket Booking

Event ticketing platform with seat selection: organizers publish events with sessions in different cities, buyers pick seats on a hall map and pay online.

> Work in progress. The plan covers a production-like backend: Express → NestJS, PostgreSQL, Redis, queues, payments, AWS.

## Tech stack

- **Runtime:** Node.js 24, TypeScript
- **API:** Express 5, Zod
- **Logging:** pino
- **Infrastructure:** Docker Compose, PostgreSQL 18
- **Tooling:** pnpm workspaces, ESLint, Prettier

## Getting started

Requirements: Node.js 24+, pnpm, Docker.

```bash
pnpm install
cp .env.example .env
pnpm infra:up
pnpm dev:express
```

API runs on `http://localhost:4000`.

## API

| Method | Path          | Description  |
| ------ | ------------- | ------------ |
| GET    | `/health`     | Health check |
| GET    | `/events`     | List events  |
| GET    | `/events/:id` | Get event    |
| POST   | `/events`     | Create event |
| PATCH  | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

Example requests: [`apps/api-express/requests`](apps/api-express/requests).

Errors use one format:

```json
{ "error": { "code": "NOT_FOUND", "message": "Event not found" } }
```

## Project structure

- `apps/api-express` — API on Express
- `apps/api-nest` — API on NestJS (planned)
- `apps/web` — frontend on Next.js (planned)
- `docs/` — [database schema](docs/database-schema.md) and [user flows](docs/user-flow.md)

## Scripts

| Script                         | Description                       |
| ------------------------------ | --------------------------------- |
| `pnpm dev:express`             | Run API in watch mode             |
| `pnpm build`                   | Build all apps                    |
| `pnpm typecheck`               | Type-check all apps               |
| `pnpm lint`                    | Lint the repo                     |
| `pnpm format`                  | Format the repo                   |
| `pnpm infra:up` / `infra:down` | Start / stop local infrastructure |
| `pnpm db:psql`                 | Open psql in the database         |
