require('dotenv').config();
console.log('[config/database] Loading Sequelize CLI config for migrations');

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: (msg) => console.log('[sequelize]', msg),
};
console.log('[config/database] Base config prepared for DB:', base.database);

module.exports = {
  development: base,
  test: base,
  production: base,
};
