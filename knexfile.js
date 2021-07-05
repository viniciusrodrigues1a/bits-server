const path = require('path');
require('dotenv').config();

const databasePath = path.resolve(__dirname, 'src', 'infra', 'database');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: process.env.POSTGRES_PORT,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(databasePath, 'migrations'),
    },
    seeds: {
      directory: path.resolve(databasePath, 'seeds'),
    },
    useNullAsDefault: false,
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.TEST_POSTGRES_HOST,
      database: process.env.TEST_POSTGRES_DB,
      user: process.env.TEST_POSTGRES_USER,
      password: process.env.TEST_POSTGRES_PASSWORD,
      port: process.env.TEST_POSTGRES_PORT,
    },
    migrations: {
      directory: path.resolve(databasePath, 'migrations'),
    },
    seeds: {
      directory: path.resolve(databasePath, 'seeds'),
    },
    useNullAsDefault: false,
  },
};
