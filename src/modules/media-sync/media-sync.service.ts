
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
import { CreateVideoMediaInformationDto } from 'src/dto/VideoMediaInformation.dto';
import { CreatePodcastMediaInformationDto } from 'src/dto/PodcastMediaInformation.dto';

@Injectable()
export class MediaSyncService {

    private readonly videoBaseUrl = config.CORS_ORIGIN + '/videos';
    private readonly podcastBaseUrl = config.CORS_ORIGIN + '/podcasts';
    private readonly audioBaseUrl = config.CORS_ORIGIN + '/audio';

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
    // const privateLogger = createContextualLogger('MediaSyncService');

    // Main sync method that syncs all media types
    async syncAllMediaData(): Promise<void> {

        privateLogger.info('Starting complete media sync job...', {context: 'MediaSyncService'});

        await Promise.all([
            this.syncVideoData(),
            this.syncAudioData(),
            this.syncPodcastData()
        ]);

      privateLogger.info('Complete media sync job finished',{ context: 'MediaSyncService' });
    }

    // Video sync method (your original)
    async syncVideoData(): Promise<void> {
        privateLogger.info('Starting video sync job...', { context: 'MediaSyncService' });

        try {
            const externalData = await this.fetchExternalData(this.videoBaseUrl);

            if (!externalData || !externalData.data || externalData.data.length === 0) {
                privateLogger.warn('No video data received from external API', { context: 'MediaSyncService' });
                return;
            }

            let processedCount = 0;
            let updatedCount = 0;
            let insertedCount = 0;

            for (const item of externalData.data) {
                try {
                    const result = await this.processVideoItem(item);
                    if (result === 'updated') {
                        updatedCount++;
                    } else if (result === 'inserted') {
                        insertedCount++;
                    }
                    processedCount++;
                } catch (error) {
                    privateLogger.error(`Error processing video item ${item.id}:`,  { context: 'MediaSyncService' }, error);
                }
            }

            privateLogger.info(`Video sync completed. Processed: ${processedCount}, Updated: ${updatedCount}, Inserted: ${insertedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
           privateLogger.error('Error during video sync:',  { context: 'MediaSyncService' }, error);
        }
    }

    // Audio sync method
    async syncAudioData(): Promise<void> {
        privateLogger.info('Starting audio sync job...', { context: 'MediaSyncService' });

        try {
            const externalData = await this.fetchExternalData(this.audioBaseUrl);

            if (!externalData || !externalData.data || externalData.data.length === 0) {
                privateLogger.warn('No audio data received from external API', { context: 'MediaSyncService' });
                return;
            }

            let processedCount = 0;
            let updatedCount = 0;
            let insertedCount = 0;

            for (const item of externalData.data) {
                try {
                    const result = await this.processAudioItem(item);
                    if (result === 'updated') {
                        updatedCount++;
                    } else if (result === 'inserted') {
                        insertedCount++;
                    }
                    processedCount++;
                } catch (error) {
                    privateLogger.error(`Error processing audio item ${item.id}:`,  { context: 'MediaSyncService' }, error);
                }
            }

          privateLogger.info(`Audio sync completed. Processed: ${processedCount}, Updated: ${updatedCount}, Inserted: ${insertedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
           privateLogger.error('Error during audio sync:',  { context: 'MediaSyncService' }, error);
        }
    }

    // Podcast sync method
    async syncPodcastData(): Promise<void> {
        privateLogger.info('Starting podcast sync job...', { context: 'MediaSyncService' });

        try {
            const externalData = await this.fetchExternalData(this.podcastBaseUrl);

            if (!externalData || !externalData.data || externalData.data.length === 0) {
                privateLogger.warn('No podcast data received from external API', { context: 'MediaSyncService' });
                return;
            }

            let processedCount = 0;
            let updatedCount = 0;
            let insertedCount = 0;

            for (const item of externalData.data) {
                try {
                    const result = await this.processPodcastItem(item);
                    if (result === 'updated') {
                        updatedCount++;
                    } else if (result === 'inserted') {
                        insertedCount++;
                    }
                    processedCount++;
                } catch (error) {
                    privateLogger.error(`Error processing podcast item ${item.id}:`,  { context: 'MediaSyncService' }, error);
                }
            }

          privateLogger.info(`Podcast sync completed. Processed: ${processedCount}, Updated: ${updatedCount}, Inserted: ${insertedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
            privateLogger.error('Error during podcast sync:',  { context: 'MediaSyncService' }, error);
        }
    }

    // Updated fetch method to accept URL parameter
    private async fetchExternalData(url: string): Promise<ExternalApiResponse> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<ExternalApiResponse>(url)
            );

            return response.data;
        } catch (error) {
            privateLogger.error(`Failed to fetch external data from ${url}:`,  { context: 'MediaSyncService' });
            throw error;
        }
    }
    // private async processMediaItem(item: ExternalMediaItem): Promise<'updated' | 'inserted'> {
    //     // Check if media already exists by mediaLink
    //     const existingMedia = await this.videoMediaModel.findOne({
    //         where: { mediaLink: item.link }
    //     });

    //     const mediaData: CreateAudioMediaInformationDto = {
    //         id: item.id,
    //         mediaID: parseInt(item.id),
    //         title: item.title,
    //         description: item.description,
    //         mediaImage: item.image,
    //         mediaLink: item.link,
    //         author: item.author,
    //         // categories: item.categories,
    //         language: item.language,
    //         // explicit: item.explicit,
    //         // mediaType: this.determineMediaType(item),
    //     };

    //     if (existingMedia) {
    //         // Update existing record
    //         await this.videoMediaModel.updateOne(
    //             { _id: existingMedia._id },
    //             {
    //                 ...mediaData,
    //                 updatedAt: new Date()
    //             }
    //         );
    //        privateLogger.debug(`Updated existing media: ${item.title}`);
    //         return 'updated';
    //     } else {
    //         // Insert new record
    //         const newMedia = new this.videoMediaModel({
    //             ...mediaData,
    //             createdAt: new Date(),
    //             updatedAt: new Date()
    //         });
    //         await newMedia.save();
    //        privateLogger.debug(`Inserted new media: ${item.title}`);
    //         return 'inserted';
    //     }
    // }
    // Video processing (updated from your original)
    private async processVideoItem(item: ExternalMediaItem): Promise<'updated' | 'inserted'> {
        // Check if media already exists by mediaLink
        const existingMedia = await this.videoMediaModel.findOne({
            where: { mediaLink: item.link }
        });

        const mediaData: CreateVideoMediaInformationDto = {
            id: item.id,
            mediaID: parseInt(item.id),
            title: item.title,
            description: item.description,
            mediaImage: item.image,
            mediaLink: item.link,
            author: item.author,
            language: item.language,
            categories: item.categories, 
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
            privateLogger.debug(`Updated existing video: ${item.title}`, { context: 'MediaSyncService' });
            return 'updated';
        } else {
            // Insert new record
            const newMedia = new this.videoMediaModel({
                ...mediaData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await newMedia.save();
            privateLogger.debug(`Inserted new video: ${item.title}`, { context: 'MediaSyncService' });
            return 'inserted';
        }
    }

    // Audio processing
    private async processAudioItem(item: ExternalMediaItem): Promise<'updated' | 'inserted'> {
        // Check if media already exists by mediaLink
        const existingMedia = await this.audioMediaModel.findOne({
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
            language: item.language,
            categories: item.categories,

        };

        if (existingMedia) {
            // Update existing record
            await this.audioMediaModel.updateOne(
                { _id: existingMedia._id },
                {
                    ...mediaData,
                    updatedAt: new Date()
                }
            );
            privateLogger.debug(`Updated existing audio: ${item.title}`, { context: 'MediaSyncService' });
            return 'updated';
        } else {
            // Insert new record
            const newMedia = new this.audioMediaModel({
                ...mediaData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await newMedia.save();
            privateLogger.debug(`Inserted new audio: ${item.title}`, { context: 'MediaSyncService' });
            return 'inserted';
        }
    }

    // Podcast processing
    private async processPodcastItem(item: ExternalMediaItem): Promise<'updated' | 'inserted'> {
        // Check if media already exists by mediaLink
        const existingMedia = await this.podcastMediaModel.findOne({
            where: { mediaLink: item.link }
        });

        const mediaData: CreatePodcastMediaInformationDto = {
            id: item.id,
            mediaID: parseInt(item.id),
            title: item.title,
            description: item.description,
            mediaImage: item.image,
            mediaLink: item.link,
            author: item.author,
            language: item.language,
            categories: item.categories, 

        };

        if (existingMedia) {
            // Update existing record
            await this.podcastMediaModel.updateOne(
                { _id: existingMedia._id },
                {
                    ...mediaData,
                    updatedAt: new Date()
                }
            );
            privateLogger.debug(`Updated existing podcast: ${item.title}`, { context: 'MediaSyncService' });
            return 'updated';
        } else {
            // Insert new record
            const newMedia = new this.podcastMediaModel({
                ...mediaData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await newMedia.save();
            privateLogger.debug(`Inserted new podcast: ${item.title}`, { context: 'MediaSyncService' });
            return 'inserted';
        }
    }


    // Delete all media data from all collections
    async deleteAllMediaData(): Promise<void> {
        privateLogger.info('Starting deletion of all media data...', { context: 'MediaSyncService' });

        try {
            const [videoResult, audioResult, podcastResult] = await Promise.all([
                this.videoMediaModel.deleteMany({}),
                this.audioMediaModel.deleteMany({}),
                this.podcastMediaModel.deleteMany({})
            ]);

            privateLogger.info(`All media data deleted successfully:`, { context: 'MediaSyncService' });
            privateLogger.info(`- Videos deleted: ${videoResult.deletedCount}`, { context: 'MediaSyncService' });
            privateLogger.info(`- Audio deleted: ${audioResult.deletedCount}`, { context: 'MediaSyncService' });
            privateLogger.info(`- Podcasts deleted: ${podcastResult.deletedCount}`, { context: 'MediaSyncService' });
            privateLogger.info(`Total records deleted: ${videoResult.deletedCount + audioResult.deletedCount + podcastResult.deletedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
            privateLogger.error('Error during media data deletion:',  { context: 'MediaSyncService' }, error);
            throw error;
        }
    }

    // Delete all video data
    async deleteAllVideoData(): Promise<void> {
        privateLogger.info('Deleting all video data...', { context: 'MediaSyncService' });

        try {
            const result = await this.videoMediaModel.deleteMany({});
            privateLogger.info(`All video data deleted. Records deleted: ${result.deletedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
            privateLogger.error('Error during video data deletion:',  { context: 'MediaSyncService' }, error);
            throw error;
        }
    }

    // Delete all audio data
    async deleteAllAudioData(): Promise<void> {
        privateLogger.info('Deleting all audio data...', { context: 'MediaSyncService' });

        try {
            const result = await this.audioMediaModel.deleteMany({});
            privateLogger.info(`All audio data deleted. Records deleted: ${result.deletedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
            privateLogger.error('Error during audio data deletion:',  { context: 'MediaSyncService' }, error);
            throw error;
        }
    }

    // Delete all podcast data
    async deleteAllPodcastData(): Promise<void> {
        privateLogger.info('Deleting all podcast data...', { context: 'MediaSyncService' });

        try {
            const result = await this.podcastMediaModel.deleteMany({});
            privateLogger.info(`All podcast data deleted. Records deleted: ${result.deletedCount}`, { context: 'MediaSyncService' });
        } catch (error) {
            privateLogger.error('Error during podcast data deletion:',  { context: 'MediaSyncService' }, error);
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