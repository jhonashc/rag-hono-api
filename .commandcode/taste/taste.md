# Taste

## Naming & shapes

- snake_case at the DB boundary: SQL text and `*Row` interfaces mirror the columns exactly, no aliasing.
- camelCase everywhere above the repository: domain types, services, schemas, responses.
- `mappers/` translate rows (snake_case) to domain (camelCase) — that is their only job.
- Types live in `interfaces/`, Zod contracts in `schemas/`.

## Data access

- Raw `Bun.SQL` only; transactions via `TransactionManager.run()`.
- One row per insert, looped inside the `tx`. Never the bulk `tx(arrayOfObjects)` helper.

## API surface

- `OpenAPIHono` + `createRoute` + `stoker/http-status-codes` on every route, with tags and operationIds.
- Success envelope is always `{ success: true, data }`.
- `multipart/form-data` is read with `c.req.valid('form')`.
- Services signal failures with `HTTPException` (`hono/http-exception`); error bodies follow `errorResponseSchema`.

## Wiring

- Import via `@/...`, never relative.
- Services/repositories are constructed manually in route files — no container.
- External contracts keep their own casing (`db.sql` DDL, OpenAI SDK fields).

## Formatting

- Prettier: `semi: true, singleQuote: true, printWidth: 120, tabWidth: 2, trailingComma: all`.
