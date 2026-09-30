# AGENTS.md

Bun + Hono RAG API (PostgreSQL + pgvector). No test, lint, typecheck, or CI scripts.

## Commands

- `bun install` — install deps (uses `bun.lock`; do not use npm/yarn).
- `docker compose up -d` — start Postgres (requires `.env` vars for compose interpolation).
- `bun run db:migrate` — run `src/db/migrate.ts` (executes `src/db/db.sql` in one transaction).
- `bun run dev` — hot-reload server at `src/index.ts`.
- Typecheck workaround (no script; plain `bunx tsc` fails on cache perms): `bunx --bun tsc --noEmit -p tsconfig.json` — only pre-existing `node_modules` `.d.ts` errors (`har-format`, `@napi-rs/canvas`) are expected; `src/` must be clean.

Setup order: copy `.env.template` → `.env` → `docker compose up -d` → `bun run db:migrate` → `bun run dev`.

## Env

- Validated fail-fast in `src/config/env.ts` via `src/schemas/env.schema.ts` (`process.exit(1)` on error). Required: `PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `DATABASE_URL`, `OPENROUTER_API_KEY`.
- `DATABASE_URL` must point at the compose DB (`pgvector/pgvector:pg18`, port from `POSTGRES_PORT`). `.env` is gitignored.

## Architecture

- Entrypoints: `src/index.ts` (Bun `port` + `fetch`) → `src/app.ts` (`OpenAPIHono`, mounts `/api/v1`, OpenAPI JSON at `/doc`, Scalar UI at `/reference`).
- Layers: `routes/` → `services/` → `repositories/` → `db/client.ts` (raw `bun` `SQL` client, pool `max: 20`). Shared types in `interfaces/`, row→domain mapping in `mappers/`, Zod contracts in `schemas/`.
- Path alias `@/*` → `src/*` (`tsconfig.json`). Import via `@/...`, never relative.
- DI: services/repositories are constructed manually in route files (e.g. `src/routes/conversations.route.ts`), not via a container. Follow that pattern.
- DB access: raw SQL with `Bun.SQL`, transactions via `TransactionManager.run()` (`src/db/transaction.ts`). There is no ORM and no migration framework — `db.sql` is a single non-idempotent `CREATE` script; re-running against a migrated DB fails.
- RAG chat flow (`MessagesService.sendMessage`): embed query → vector search scoped by conversation (`<=>`, `TOP_K_CHUNKS` const) → OpenRouter chat (`CHAT_MODEL` const, a `:free` model — not an env var) → one transaction saving user message (tokens 0,0), assistant message (real `usage` tokens), and `message_sources` with rank/similarity.

## Conventions & gotchas

- Prettier: `semi: true, singleQuote: true, printWidth: 120, tabWidth: 2, trailingComma: all` (`.prettierrc`). No eslint config.
- DB boundary is snake_case: SQL column references and `*Row` interfaces mirror the DB exactly — never alias columns (`SELECT created_at`, not `AS "createdAt"`). Everything above the repository (domain interfaces, services, schemas, responses) is camelCase; `mappers/` translate between the two. Never use the bulk `tx(arrayOfObjects)` insert helper — its keys must be real column names; loop single-row inserts inside the `tx` instead. Only other snake_case allowed: `db.sql` DDL and OpenAI SDK fields (`encoding_format`, `usage.prompt_tokens`), which are external contracts.
- API style: `OpenAPIHono` + `@hono/zod-openapi` `createRoute` + `stoker/http-status-codes`. Keep OpenAPI tags/operationIds on new routes. Success envelope is always `{ success: true, data }`.
- `multipart/form-data` bodies (e.g. `POST /:id/documents`) are validated with target `'form'` by `@hono/zod-openapi` (verified in its `dist` source) — read them with `c.req.valid('form')`, not `'json'`.
- Errors: services throw `HTTPException` from `hono/http-exception`; `errorResponseSchema` (`src/schemas/error.schema.ts`) for error bodies.
- Embeddings are `VECTOR(1024)` with HNSW cosine index; OpenAI client targets OpenRouter (`src/config/openai.ts`), key is `OPENROUTER_API_KEY`. Vector params are inlined as `` ${JSON.stringify(embedding)}::vector ``.
