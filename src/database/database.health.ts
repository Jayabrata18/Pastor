import { Injectable } from '@nestjs/common';
import {
    HealthIndicator,
    HealthIndicatorResult,
    HealthCheckError
} from '@nestjs/terminus';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
    constructor(private readonly databaseService: DatabaseService) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            const isConnected = await this.databaseService.isConnected();
            const canPing = await this.databaseService.ping();
            const status = await this.databaseService.getConnectionStatus();

            if (isConnected && canPing) {
                const stats = await this.databaseService.getDatabaseStats();
                return this.getStatus(key, true, {
                    status,
                    collections: stats.collections,
                    dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
                    objects: stats.objects,
                });
            }

            throw new HealthCheckError(
                'Database health check failed',
                this.getStatus(key, false, { status, connected: isConnected, ping: canPing }),
            );
        } catch (error) {
            throw new HealthCheckError(
                'Database health check failed',
                this.getStatus(key, false, { error: error.message }),
            );
        }
    }
}