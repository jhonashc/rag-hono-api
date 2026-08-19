## Description

A simple REST API built with Bun, Hono, PostgreSQL and pgvector.

## Setup:

1. Rename `.env.template` to `.env`

2. Update the environment variables in the `.env` file.

3. Start the PostgreSQL container:

   ```bash
   $ docker compose up -d
   ```

4. Install dependencies:
   ```bash
   $ bun install
   ```

5. Running the app:

   ```bash
   # development mode
   $ bun run dev
   ```
