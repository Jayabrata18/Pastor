import { Injectable,  OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
    DatabaseConnectionException,
    DatabaseTimeoutException
} from './exceptions/database.exceptions';
import privateLogger from 'src/log/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {

    constructor(@InjectConnection() private readonly connection: Connection) { }

    async onModuleInit() {
        await this.setupConnectionEventListeners();
        privateLogger.info('Database service initialized', { context: 'DatabaseService' });
    }

    async onModuleDestroy() {
        if (this.connection.readyState === 1) {
            await this.connection.close();
            privateLogger.info('Database connection closed', { context: 'DatabaseService' });
        }
    }

    private async setupConnectionEventListeners() {
        this.connection.on('connected', () => {
            privateLogger.info('Database connected successfully', { context: 'DatabaseService' });
        });

        this.connection.on('disconnected', () => {
            privateLogger.warn('Database disconnected', { context: 'DatabaseService' });
        });

        this.connection.on('error', (error) => {
            privateLogger.error('Database connection error:', error, { context: 'DatabaseService' });
        });

        this.connection.on('reconnected', () => {
            privateLogger.info('Database reconnected', { context: 'DatabaseService' });
        });

        this.connection.on('timeout', () => {
            privateLogger.error('Database connection timeout', { context: 'DatabaseService' });
        });
    }

    async isConnected(): Promise<boolean> {
        return this.connection.readyState === 1;
    }

    async getConnectionStatus(): Promise<string> {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        return states[this.connection.readyState] || 'unknown';
    }

    async ping(): Promise<boolean> {
        try {
            if (!this.connection.db) {
                privateLogger.error('Database connection is not established', { context: 'DatabaseService.ping' });
                throw new Error('Database connection is not established');
            }
            await this.connection.db.admin().ping();
            return true;
        } catch (error) {
            privateLogger.error('Database ping failed:', error, { context: 'DatabaseService.ping' });
            return false;
        }
    }

    async getDatabaseStats(): Promise<any> {
        try {
            if (!this.connection.db) {
                throw new DatabaseConnectionException('Database connection is not established');
            }
            const stats = await this.connection.db.stats();
            return {
                collections: stats.collections,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize,
                objects: stats.objects,
            };
        } catch (error) {
            privateLogger.error('Failed to get database stats:', error, { context: 'DatabaseService.getDatabaseStats' });
            throw new DatabaseConnectionException('Unable to retrieve database statistics');
        }
    }

    async executeWithRetry<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000,
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                privateLogger.warn(
                    `Database operation failed (attempt ${attempt}/${maxRetries}):`,
                    error.message,
                );

                if (attempt === maxRetries) {
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }

        throw lastError;
    }

    async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeoutMs: number = 30000,
    ): Promise<T> {
        return Promise.race([
            operation(),
            new Promise<T>((_, reject) => {
                setTimeout(() => {
                    reject(new DatabaseTimeoutException('Operation timeout'));
                }, timeoutMs);
            }),
        ]);
    }
}