const dotenv = require('dotenv');
dotenv.config();

const dev = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || process.env.DEV_PORT,
  HOST: process.env.DEV_HOST,
  DB_HOST: process.env.DEV_DB_HOST,
  DB_PORT: process.env.DEV_DB_PORT,
  DB_USER: process.env.DEV_DB_USER,
  DB_PASSWORD: process.env.DEV_DB_PASSWORD,
  DB_NAME: process.env.DEV_DB_NAME,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  PAYMENT_GATEWAY_URL: process.env.TEST_PAYMENT_GATEWAY_URL,
  MARCHANT_ID: process.env.TEST_MARCHANT_ID,
  UPAYMENTS_USERNAME: process.env.TEST_UPAYMENTS_USERNAME,
  UPAYMENTS_PASSWORD: process.env.TEST_UPAYMENTS_PASSWORD,
  UPAYMENTS_API_KEY: process.env.TEST_UPAYMENTS_API_KEY,
  VIMEO_CLIENT_ID: process.env.VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET: process.env.VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
  VIMEO_HOST_URL: process.env.VIMEO_HOST_URL,
};

const production = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || process.env.PRODUCTION_PORT,
  HOST: process.env.PRODUCTION_HOST,
  DB_HOST: process.env.PRODUCTION_DB_HOST,
  DB_PORT: process.env.PRODUCTION_DB_PORT,
  DB_USER: process.env.PRODUCTION_DB_USER,
  DB_PASSWORD: process.env.PRODUCTION_DB_PASSWORD,
  DB_NAME: process.env.PRODUCTION_DB_NAME,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  PAYMENT_GATEWAY_URL: process.env.PRODUCTION_PAYMENT_GATEWAY_URL,
  MARCHANT_ID: process.env.PRODUCTION_MARCHANT_ID,
  UPAYMENTS_USERNAME: process.env.PRODUCTION_UPAYMENTS_USERNAME,
  UPAYMENTS_PASSWORD: process.env.PRODUCTION_UPAYMENTS_PASSWORD,
  UPAYMENTS_API_KEY: process.env.PRODUCTION_UPAYMENTS_API_KEY,
  VIMEO_CLIENT_ID: process.env.VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET: process.env.VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
  VIMEO_HOST_URL: process.env.VIMEO_HOST_URL,
};

const config = {
  dev,
  production,
};

const env = process.env.NODE_ENV;

module.exports = config[env];
