const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = require('./env.config');

const db_config_postgresql = {
  HOST: DB_HOST,
  PORT: DB_PORT,
  USER: DB_USER,
  PASSWORD: DB_PASSWORD,
  DB: DB_NAME,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const db_config_mysql = {
  HOST: DB_HOST,
  PORT: DB_PORT,
  USER: DB_USER,
  PASSWORD: DB_PASSWORD,
  DB: DB_NAME,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const db_config = {
  dev: db_config_mysql,
  production: db_config_postgresql,
};

const env = process.env.NODE_ENV;

module.exports = db_config[env];
