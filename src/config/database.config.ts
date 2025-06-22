import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    uri: process.env.DATABASE_URL || (() => { throw new Error('DATABASE_URL is not defined'); })(),
    options: {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE ?? '10', 10),
        // serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT ?? '5000', 5000),
        // socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT ?? '45000', 45000),
        // // bufferMaxEntries: 0,
        // // bufferCommands: false,
        // retryWrites: true,
        // retryReads: true,
    },
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS ?? '3', 3),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY ?? '1000', 1000),
}));