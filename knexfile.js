require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.test' });

module.exports = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: { directory: process.env.DB_MIGRATIONS_PATH },
  seeds: { directory: process.env.DB_SEEDS_PATH },
};
