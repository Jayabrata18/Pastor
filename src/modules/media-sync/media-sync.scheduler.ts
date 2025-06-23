import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaSyncService } from './media-sync.service';
import privateLogger from 'src/log/logger';

@Injectable()
export class MediaSyncScheduler {
    private readonly logger = new Logger(MediaSyncScheduler.name);

    constructor(private readonly mediaSyncService: MediaSyncService) { }

    // Run every hour
    @Cron(CronExpression.EVERY_HOUR)
    async handleHourlySync(): Promise<void> {
        this.logger.log('Running hourly media sync...');
        await this.mediaSyncService.syncMediaData();
    }
    // Run every 1 minutes
    @Cron('*/1 * * * *')
    async handleFrequentSync(): Promise<void> {
        this.logger.log('Running media sync every 1 minutes...');
        privateLogger.info('Running media sync every 1 minutes...');
        await this.mediaSyncService.syncMediaData();
    }

    // Alternative: Run every hour at minute 0
    // @Cron('0 * * * *')
    // async handleHourlySync(): Promise<void> {
    //     this.logger.log('Running hourly media sync...');
    //     await this.mediaSyncService.syncMediaData();
    // }

    // You can also add other schedules like daily cleanup
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyCleanup(): Promise<void> {
        this.logger.log('Running daily maintenance...');
        // Add any daily maintenance tasks here
    }
}
