import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private databaseHealthIndicator: DatabaseHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.databaseHealthIndicator.isHealthy('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.9,
            }),
        ]);
    }

    @Get('database')
    @HealthCheck()
    checkDatabase() {
        return this.health.check([
            () => this.databaseHealthIndicator.isHealthy('database'),
        ]);
    }
}