// // media-sync.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { AudioMediaInformation, AudioMediaInformationDocument } from 'src/entities/audioMediaInformation.entity';
// import { PodcastMediaInformation, PodcastMediaInformationDocument } from 'src/entities/PodcastMediaInformation.entity';
// import { VideoMediaInformation, VideoMediaInformationDocument } from 'src/entities/VideoMediaInformation.entity';
// import { CategoryInformation, CategoryInformationDocument } from 'src/entities/categoryInformation.entity';
// import { ErrorLogInformation, ErrorLogInformationDocument } from 'src/entities/errorLogInformation.entity';
// import privateLogger from 'src/log/logger';
// import config from '../../config/config'; 

// interface ApiResponse {
//     status: string;
//     data: MediaItem[];
// }

// interface MediaItem {
//     _id: string;
//     title: string;
//     description: string;
//     image: string;
//     link: string;
//     author: string;
//     categories: string[];
//     language: string;
//     explicit: boolean;
// }

// interface SyncResult {
//     totalProcessed: number;
//     created: number;
//     updated: number;
//     errors: number;
//     skipped: number;
//     duplicateIds: number;
//     duplicateLinks: number;
// }

// @Injectable()
// export class MediaSyncService {


//     private readonly baseUrl = config.CORS_ORIGIN;

//     constructor(
//         private readonly httpService: HttpService,
//         @InjectModel(AudioMediaInformation.name)
//         private audioMediaModel: Model<AudioMediaInformationDocument>,
//         @InjectModel(PodcastMediaInformation.name)
//         private podcastMediaModel: Model<PodcastMediaInformationDocument>,
//         @InjectModel(VideoMediaInformation.name)
//         private videoMediaModel: Model<VideoMediaInformationDocument>,
//         @InjectModel(CategoryInformation.name)
//         private categoryModel: Model<CategoryInformationDocument>,
//         @InjectModel(ErrorLogInformation.name)
//         private errorLogModel: Model<ErrorLogInformationDocument>,
//     ) { }

//     // Main cron job - runs every hour
//     @Cron(CronExpression.EVERY_HOUR)
//     async syncAllMediaHourly() {
//         const startTime = Date.now();
//         privateLogger.info('🚀 Starting hourly media sync job...');

//         try {
//             const results = await Promise.allSettled([
//                 this.syncMediaType('videos', this.videoMediaModel),
//                 this.syncMediaType('podcasts', this.podcastMediaModel),
//                 this.syncMediaType('audio', this.audioMediaModel),
//             ]);

//             const successResults = results
//                 .filter((result): result is PromiseFulfilledResult<SyncResult> => result.status === 'fulfilled')
//                 .map(result => result.value);

//             const totalStats = this.aggregateResults(successResults);
//             const executionTime = Date.now() - startTime;

//             privateLogger.info(`✅ Hourly media sync completed successfully in ${executionTime}ms`);
//             privateLogger.info(`📊 Total Stats: ${JSON.stringify(totalStats)}`);

//             // Log any failures
//             results.forEach((result, index) => {
//                 if (result.status === 'rejected') {
//                     const mediaType = ['videos', 'podcasts', 'audio'][index];
//                     privateLogger.error(`❌ Failed to sync ${mediaType}: ${result.reason.message}`);
//                     this.logError('MediaSyncService', 'syncAllMediaHourly',
//                         `Failed to sync ${mediaType}: ${result.reason.message}`);
//                 }
//             });

//             return totalStats;
//         } catch (error) {
//             const executionTime = Date.now() - startTime;
//             privateLogger.error(`💥 Hourly media sync job failed after ${executionTime}ms: ${error.message}`);
//             await this.logError('MediaSyncService', 'syncAllMediaHourly', error.message);
//             throw error;
//         }
//     }

//     async syncMediaType(mediaType: 'videos' | 'podcasts' | 'audio', model: Model<any>): Promise<SyncResult> {
//         const startTime = Date.now();
//         privateLogger.info(`🔄 Starting ${mediaType} sync...`);

//         const result: SyncResult = {
//             totalProcessed: 0,
//             created: 0,
//             updated: 0,
//             errors: 0,
//             skipped: 0,
//             duplicateIds: 0,
//             duplicateLinks: 0
//         };

//         try {
//             // Fetch data from API
//             const response = await firstValueFrom(
//                 this.httpService.get<ApiResponse>(`${this.baseUrl}/${mediaType}`)
//             );

//             if (response.data.status !== 'success') {
//                 privateLogger.error(`❌ API returned error status: ${response.data.status}`);
//                 await this.logError('MediaSyncService', `sync${mediaType}`, `API returned status: ${response.data.status}`);
//                 throw new Error(`API returned status: ${response.data.status}`);
//             }

//             const items = response.data.data;
//             result.totalProcessed = items.length;

//             privateLogger.info(`📥 Fetched ${items.length} ${mediaType} items from API`);

//             // Check for uniqueness and process items
//             const { uniqueItems, duplicateStats } = await this.checkUniqueness(items, model, mediaType);
//             result.duplicateIds = duplicateStats.duplicateIds;
//             result.duplicateLinks = duplicateStats.duplicateLinks;
//             result.skipped = duplicateStats.duplicateIds + duplicateStats.duplicateLinks;

//             privateLogger.info(`🔍 Uniqueness check for ${mediaType}: ${uniqueItems.length} unique items, ${result.skipped} duplicates skipped`);

//             // Process unique items
//             for (const item of uniqueItems) {
//                 try {
//                     const processResult = await this.processMediaItem(item, mediaType, model);
//                     if (processResult.created) {
//                         result.created++;
//                     } else {
//                         result.updated++;
//                     }
//                 } catch (error) {
//                     result.errors++;
//                     privateLogger.error(`❌ Failed to process ${mediaType} item ${item._id}: ${error.message}`);
//                     await this.logError('MediaSyncService', `process${mediaType}Item`,
//                         `Failed to process item ${item.id}: ${error.message}`);
//                 }
//             }

//             const executionTime = Date.now() - startTime;
//             privateLogger.info(`✅ ${mediaType} sync completed in ${executionTime}ms: ${JSON.stringify(result)}`);

//             return result;
//         } catch (error) {
//             const executionTime = Date.now() - startTime;
//             result.errors++;
//             privateLogger.error(`💥 ${mediaType} sync failed after ${executionTime}ms: ${error.message}`);
//             await this.logError('MediaSyncService', `sync${mediaType}`, error.message);
//             throw error;
//         }
//     }

//     private async checkUniqueness(
//         items: MediaItem[],
//         model: Model<any>,
//         mediaType: string
//     ): Promise<{ uniqueItems: MediaItem[], duplicateStats: { duplicateIds: number, duplicateLinks: number } }> {
//         privateLogger.info(`🔍 Checking uniqueness for ${items.length} ${mediaType} items...`);

//         const duplicateStats = { duplicateIds: 0, duplicateLinks: 0 };
//         const uniqueItems: MediaItem[] = [];
//         const seenIds = new Set<string>();
//         const seenLinks = new Set<string>();

//         // Check for duplicates within the current batch
//         for (const item of items) {
//             let isDuplicate = false;

//             // Check for duplicate ID in current batch
//             if (seenIds.has(item.id)) {
//                 duplicateStats.duplicateIds++;
//                 isDuplicate = true;
//                 privateLogger.warn(`⚠️ Duplicate ID found in batch: ${item.id} for ${mediaType}`);
//                 await this.logError('MediaSyncService', 'checkUniqueness',
//                     `Duplicate ID in batch: ${item.id} for ${mediaType}`);
//             }

//             // Check for duplicate link in current batch
//             if (seenLinks.has(item.link)) {
//                 duplicateStats.duplicateLinks++;
//                 isDuplicate = true;
//                 privateLogger.warn(`⚠️ Duplicate link found in batch: ${item.link} for ${mediaType}`);
//                 await this.logError('MediaSyncService', 'checkUniqueness',
//                     `Duplicate link in batch: ${item.link} for ${mediaType}`);
//             }

//             if (!isDuplicate) {
//                 seenIds.add(item.id);
//                 seenLinks.add(item.link);
//                 uniqueItems.push(item);
//             }
//         }

//         // Check for existing records in database
//         const existingRecords = await model.find({
//             $or: [
//                 { mediaID: { $in: uniqueItems.map(item => parseInt(item.id)) } },
//                 { mediaLink: { $in: uniqueItems.map(item => item.link) } }
//             ]
//         }).exec();

//         const existingIds = new Set(existingRecords.map(record => record.mediaID.toString()));
//         const existingLinks = new Set(existingRecords.map(record => record.mediaLink));

//         privateLogger.info(`📊 Found ${existingRecords.length} existing records in database for ${mediaType}`);

//         // Log existing records that will be updated
//         for (const record of existingRecords) {
//             privateLogger.info(`🔄 Will update existing ${mediaType} record: ID=${record.mediaID}, Title="${record.title}"`);
//         }

//         return { uniqueItems, duplicateStats };
//     }

//     private async processMediaItem(
//         item: MediaItem,
//         mediaType: string,
//         model: Model<any>
//     ): Promise<{ created: boolean }> {
//         const mediaID = parseInt(item.id);

//         privateLogger.info(`🔄 Processing ${mediaType} item: ID=${mediaID}, Title="${item.title}"`);

//         const mediaData = {
//             mediaID,
//             title: item.title,
//             description: item.description,
//             mediaImage: item.image,
//             mediaLink: item.link,
//             author: item.author,
//             type: mediaType,
//             language: item.language,
//             modifiedBy: 'system',
//             modifiedDate: new Date(),
//         };

//         // Check if record exists
//         const existingRecord = await model.findOne({
//             $or: [
//                 { mediaID },
//                 { mediaLink: item.link }
//             ]
//         }).exec();

//         let created = false;

//         if (existingRecord) {
//             // Update existing record
//             await model.updateOne(
//                 { _id: existingRecord._id },
//                 { $set: mediaData }
//             ).exec();

//             privateLogger.info(`📝 Updated existing ${mediaType} record: ID=${mediaID}`);
//         } else {
//             // Create new record
//             const newRecord = new model({
//                 ...mediaData,
//                 createdBy: 'system',
//                 createdDate: new Date(),
//             });

//             await newRecord.save();
//             created = true;

//             privateLogger.info(`➕ Created new ${mediaType} record: ID=${mediaID}`);
//         }

//         // Process categories
//         if (item.categories && item.categories.length > 0) {
//             await this.processCategories(mediaID, item.categories, mediaType);
//         }

//         return { created };
//     }

//     private async processCategories(mediaID: number, categories: string[], type: string) {
//         try {
//             privateLogger.info(`🏷️ Processing ${categories.length} categories for ${type} ID=${mediaID}`);

//             // Remove existing categories
//             const deleteResult = await this.categoryModel.deleteMany({ mediaID, type }).exec();
//             privateLogger.info(`🗑️ Removed ${deleteResult.deletedCount} existing categories for ${type} ID=${mediaID}`);

//             // Insert new categories
//             const categoryDocs = categories.map(categoryName => ({
//                 mediaID,
//                 type,
//                 categoryName: categoryName.trim(),
//                 createdBy: 'system',
//                 modifiedBy: 'system',
//                 createdDate: new Date(),
//                 modifiedDate: new Date(),
//             }));

//             if (categoryDocs.length > 0) {
//                 const insertResult = await this.categoryModel.insertMany(categoryDocs);
//                 privateLogger.info(`🏷️ Added ${insertResult.length} categories for ${type} ID=${mediaID}`);
//             }
//         } catch (error) {
//             privateLogger.error(`❌ Failed to process categories for ${type} ID=${mediaID}: ${error.message}`);
//             await this.logError('MediaSyncService', 'processCategories',
//                 `Failed to process categories for ${type} ${mediaID}: ${error.message}`);
//             throw error;
//         }
//     }

//     private async logError(pageName: string, eventName: string, errorMessage: string) {
//         try {
//             const errorLog = new this.errorLogModel({
//                 errorInformation: errorMessage,
//                 pageName,
//                 eventName,
//                 createdBy: 'system',
//                 modifiedBy: 'system',
//                 createdDate: new Date(),
//                 modifiedDate: new Date(),
//             });

//             await errorLog.save();
//             privateLogger.info(`📝 Error logged to database: ${eventName} - ${errorMessage}`);
//         } catch (error) {
//             privateLogger.error(`💥 Failed to log error to database: ${error.message}`);
//         }
//     }

//     private aggregateResults(results: SyncResult[]): SyncResult {
//         return results.reduce((total, current) => ({
//             totalProcessed: total.totalProcessed + current.totalProcessed,
//             created: total.created + current.created,
//             updated: total.updated + current.updated,
//             errors: total.errors + current.errors,
//             skipped: total.skipped + current.skipped,
//             duplicateIds: total.duplicateIds + current.duplicateIds,
//             duplicateLinks: total.duplicateLinks + current.duplicateLinks,
//         }), {
//             totalProcessed: 0,
//             created: 0,
//             updated: 0,
//             errors: 0,
//             skipped: 0,
//             duplicateIds: 0,
//             duplicateLinks: 0,
//         });
//     }

//     // Manual sync methods
//     async manualSyncAll(): Promise<SyncResult> {
//         privateLogger.info('🚀 Manual sync all media triggered');
//         return this.syncAllMediaHourly();
//     }

//     async manualSyncVideos(): Promise<SyncResult> {
//         privateLogger.info('🚀 Manual videos sync triggered');
//         return this.syncMediaType('videos', this.videoMediaModel);
//     }

//     async manualSyncPodcasts(): Promise<SyncResult> {
//         privateLogger.info('🚀 Manual podcasts sync triggered');
//         return this.syncMediaType('podcasts', this.podcastMediaModel);
//     }

//     async manualSyncAudio(): Promise<SyncResult> {
//         privateLogger.info('🚀 Manual audio sync triggered');
//         return this.syncMediaType('audio', this.audioMediaModel);
//     }

//     async getSyncStatus() {
//         try {
//             privateLogger.info('📊 Getting sync status...');

//             const [videoCount, podcastCount, audioCount, categoryCount, errorCount] = await Promise.all([
//                 this.videoMediaModel.countDocuments().exec(),
//                 this.podcastMediaModel.countDocuments().exec(),
//                 this.audioMediaModel.countDocuments().exec(),
//                 this.categoryModel.countDocuments().exec(),
//                 this.errorLogModel.countDocuments().exec(),
//             ]);

//             const status = {
//                 videos: videoCount,
//                 podcasts: podcastCount,
//                 audio: audioCount,
//                 categories: categoryCount,
//                 errors: errorCount,
//                 lastChecked: new Date(),
//             };

//             privateLogger.info(`📊 Sync status retrieved: ${JSON.stringify(status)}`);
//             return status;
//         } catch (error) {
//             privateLogger.error(`❌ Failed to get sync status: ${error.message}`);
//             await this.logError('MediaSyncService', 'getSyncStatus', error.message);
//             throw error;
//         }
//     }

//     async getErrorLogs(limit: number = 50) {
//         try {
//             privateLogger.info(`📋 Retrieving last ${limit} error logs...`);

//             const errorLogs = await this.errorLogModel
//                 .find()
//                 .sort({ createdDate: -1 })
//                 .limit(limit)
//                 .exec();

//             privateLogger.info(`📋 Retrieved ${errorLogs.length} error logs`);
//             return errorLogs;
//         } catch (error) {
//             privateLogger.error(`❌ Failed to get error logs: ${error.message}`);
//             throw error;
//         }
//     }
// }

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AudioMediaInformation, AudioMediaInformationDocument } from 'src/entities/audioMediaInformation.entity';
import { PodcastMediaInformation, PodcastMediaInformationDocument } from 'src/entities/PodcastMediaInformation.entity';
import { VideoMediaInformation, VideoMediaInformationDocument } from 'src/entities/VideoMediaInformation.entity';
import { CategoryInformation, CategoryInformationDocument } from 'src/entities/categoryInformation.entity';
import { ErrorLogInformation, ErrorLogInformationDocument } from 'src/entities/errorLogInformation.entity';
import privateLogger from 'src/log/logger';
import config from '../../config/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExternalApiResponse, ExternalMediaItem } from './external-api.interface';
import { CreateAudioMediaInformationDto } from 'src/dto/AudioMediaInformation.dto';

@Injectable()
export class MediaSyncService {
    private readonly logger = new Logger(MediaSyncService.name);
    private readonly baseUrl = config.CORS_ORIGIN;

    constructor(
        private readonly httpService: HttpService,
        @InjectModel(AudioMediaInformation.name)
        private audioMediaModel: Model<AudioMediaInformationDocument>,
        @InjectModel(PodcastMediaInformation.name)
        private podcastMediaModel: Model<PodcastMediaInformationDocument>,
        @InjectModel(VideoMediaInformation.name)
        private videoMediaModel: Model<VideoMediaInformationDocument>,
        @InjectModel(CategoryInformation.name)
        private categoryModel: Model<CategoryInformationDocument>,
        @InjectModel(ErrorLogInformation.name)
        private errorLogModel: Model<ErrorLogInformationDocument>,
    ) { }

    async syncMediaData(): Promise<void> {
        this.logger.log('Starting media sync job...');

        try {
            const externalData = await this.fetchExternalData();

            if (!externalData || !externalData.data || externalData.data.length === 0) {
                this.logger.warn('No data received from external API');
                return;
            }

            let processedCount = 0;
            let updatedCount = 0;
            let insertedCount = 0;

            for (const item of externalData.data) {
                try {
                    const result = await this.processMediaItem(item);
                    if (result === 'updated') {
                        updatedCount++;
                    } else if (result === 'inserted') {
                        insertedCount++;
                    }
                    processedCount++;
                } catch (error) {
                    this.logger.error(`Error processing item ${item.id}:`, error);
                }
            }

            this.logger.log(`Media sync completed. Processed: ${processedCount}, Updated: ${updatedCount}, Inserted: ${insertedCount}`);
        } catch (error) {
            this.logger.error('Error during media sync:', error);
        }
    }

    private async fetchExternalData(): Promise<ExternalApiResponse> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<ExternalApiResponse>(this.baseUrl)
            );

            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch external data:', error);
            throw error;
        }
    }

    private async processMediaItem(item: ExternalMediaItem): Promise<'updated' | 'inserted'> {
        // Check if media already exists by mediaLink
        const existingMedia = await this.videoMediaModel.findOne({
            where: { mediaLink: item.link }
        });

        const mediaData: CreateAudioMediaInformationDto = {
            id: item.id,
            mediaID: parseInt(item.id),
            title: item.title,
            description: item.description,
            mediaImage: item.image,
            mediaLink: item.link,
            author: item.author,
            // categories: item.categories,
            language: item.language,
            // explicit: item.explicit,
            // mediaType: this.determineMediaType(item),
        };

        if (existingMedia) {
            // Update existing record
            await this.videoMediaModel.updateOne(
                { _id: existingMedia._id },
                {
                    ...mediaData,
                    updatedAt: new Date()
                }
            );
            this.logger.debug(`Updated existing media: ${item.title}`);
            return 'updated';
        } else {
            // Insert new record
            const newMedia = new this.videoMediaModel({
                ...mediaData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await newMedia.save();
            this.logger.debug(`Inserted new media: ${item.title}`);
            return 'inserted';
        }
    }

    private determineMediaType(item: ExternalMediaItem): string {
        // Determine media type based on categories or other criteria
        if (item.categories.some(cat => cat.toLowerCase().includes('podcast'))) {
            return 'podcast';
        } else if (item.categories.some(cat => cat.toLowerCase().includes('video'))) {
            return 'video';
        } else {
            return 'audio';
        }
    }

    async deleteAllMediaData(): Promise<void> {
        privateLogger.info('Deleting all media data...');
        try {
            const result = await this.videoMediaModel.deleteMany({});
            privateLogger.warn(`Deleted ${result.deletedCount} media records`);
        } catch (error) {
            privateLogger.error('Error deleting media data:', error);
            throw error;
        }
    }
    

    async getMediaStats(): Promise<any> {
        const totalCount = await this.videoMediaModel.countDocuments();
        const audioCount = await this.videoMediaModel.countDocuments({ mediaType: 'audio' });
        const podcastCount = await this.videoMediaModel.countDocuments({ mediaType: 'podcast' });
        const videoCount = await this.videoMediaModel.countDocuments({ mediaType: 'video' });

        return {
            total: totalCount,
            audio: audioCount,
            podcast: podcastCount,
            video: videoCount,
            lastSync: new Date()
        };
    }
}