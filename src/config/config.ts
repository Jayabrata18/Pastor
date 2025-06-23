import 'dotenv/config';

export default {
    ENV: process.env.ENV || 'development',
    PORT: parseInt(process.env.PORT || '5555', 10), // Convert to number with base 10
    HOST: process.env.HOST || '0.0.0.0',
    npm_package_version: process.env.npm_package_version || '0.0.1',
    DATABASE_URL: process.env.DATABASE_URL || '',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};