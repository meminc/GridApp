-- Initial schema for Postgres/TimescaleDB
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
); 