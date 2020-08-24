const dotenv = require('dotenv');
dotenv.config();

const dev = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.DEV_PORT,
  HOST: process.env.DEV_HOST,
  DB_HOST: process.env.DEV_DB_HOST,
  DB_PORT: process.env.DEV_DB_PORT,
  DB_USER: process.env.DEV_DB_USER,
  DB_PASSWORD: process.env.DEV_DB_PASSWORD,
  DB_NAME: process.env.DEV_DB_NAME,
};

const production = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PRODUCTION_PORT,
  HOST: process.env.DEV_HOST,
  DB_HOST: process.env.DEV_DB_HOST,
  DB_PORT: process.env.DEV_DB_PORT,
  DB_USER: process.env.DEV_DB_USER,
  DB_PASSWORD: process.env.DEV_DB_PASSWORD,
  DB_NAME: process.env.DEV_DB_NAME,
};

const config = {
  dev,
  production,
};

const env = process.env.NODE_ENV;

module.exports = config[env];
