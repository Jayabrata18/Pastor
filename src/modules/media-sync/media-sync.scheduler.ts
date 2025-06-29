import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaSyncService } from './media-sync.service';
import privateLogger from 'src/log/logger';

@Injectable()
export class MediaSyncScheduler {

    constructor(private readonly mediaSyncService: MediaSyncService) { }

    // Run every hour
    @Cron(CronExpression.EVERY_HOUR)
    async handleHourlySync(): Promise<void> {
        privateLogger.info('Running hourly media sync...', { context: 'handleHourlySync' });
        await this.mediaSyncService.syncAllMediaData();
    }
    // Run every 1 minutes
    @Cron('*/1 * * * *')
    async handleFrequentSync(): Promise<void> {
        privateLogger.info('Running media sync every 1 minutes...', { context: 'handleFrequentSync' });
        await this.mediaSyncService.syncAllMediaData();
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
        privateLogger.info('Running daily maintenance...', { context: 'handleDailyCleanup' });
        // Add any daily maintenance tasks here
    }
}
