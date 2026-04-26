require('dotenv').config();
console.log('[config/db] Bootstrapping pg Pool for raw SQL queries');

const { Pool, types } = require('pg');


// Return DATE columns as plain strings (e.g. "2026-04-22") instead of JS Date objects
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});
console.log('[config/db] pg Pool created for DB:', process.env.DB_NAME);

pool.on('connect', () => {
  console.log('[config/db] New client connected to Postgres');
});

pool.on('error', (err) => {
  console.log('[config/db] Unexpected pg Pool error:', err.message);
});

const query = async (text, params = []) => {
  console.log('[config/db.query] Executing SQL:', text);
  console.log('[config/db.query] Params:', params);
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    console.log('[config/db.query] Rows returned:', result.rowCount, 'in', Date.now() - start, 'ms');
    return result;
  } catch (err) {
    console.log('[config/db.query] Query failed:', err.message);
    throw err;
  }
};

module.exports = { pool, query };
