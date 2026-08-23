## Description

A simple REST API built with Bun, Hono, PostgreSQL and pgvector.

## Setup:

1. Rename `.env.template` to `.env`

2. Update the environment variables in the `.env` file.

3. Start the database container:
   ```bash
   docker compose up -d
   ```

4. Run the database migrations:
   ```bash
   bun run db:migrate
   ```

5. Install dependencies:
   ```bash
   bun install
   ```

6. Running the app:
   ```bash
   # development mode
   bun run dev
   ```
