-- Extra setup on the shared Postgres instance (Agenci app DB is POSTGRES_DB=agenci).

-- Enable pgvector in the default app database (runs as superuser during init).
\connect agenci
CREATE EXTENSION IF NOT EXISTS vector;
