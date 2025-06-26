const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  user: process.env.PGUSER || 'griduser',
  password: process.env.PGPASSWORD || 'gridpass',
  database: process.env.PGDATABASE || 'grid',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5430,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 