import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
    DatabaseConnectionException,
    DatabaseTimeoutException
} from './exceptions/database.exceptions';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@InjectConnection() private readonly connection: Connection) { }

    async onModuleInit() {
        await this.setupConnectionEventListeners();
        this.logger.log('Database service initialized');
    }

    async onModuleDestroy() {
        if (this.connection.readyState === 1) {
            await this.connection.close();
            this.logger.log('Database connection closed');
        }
    }

    private async setupConnectionEventListeners() {
        this.connection.on('connected', () => {
            this.logger.log('Database connected successfully');
        });

        this.connection.on('disconnected', () => {
            this.logger.warn('Database disconnected');
        });

        this.connection.on('error', (error) => {
            this.logger.error('Database connection error:', error);
        });

        this.connection.on('reconnected', () => {
            this.logger.log('Database reconnected');
        });

        this.connection.on('timeout', () => {
            this.logger.error('Database connection timeout');
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
                throw new Error('Database connection is not established');
            }
            await this.connection.db.admin().ping();
            return true;
        } catch (error) {
            this.logger.error('Database ping failed:', error);
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
            this.logger.error('Failed to get database stats:', error);
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
                this.logger.warn(
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