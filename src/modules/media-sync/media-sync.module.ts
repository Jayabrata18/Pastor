// media-sync.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { MediaSyncService } from './media-sync.service';
import { MediaSyncController } from './media-sync.controller';
import { AudioMediaInformation, AudioMediaInformationSchema } from 'src/entities/audioMediaInformation.entity';
import { PodcastMediaInformation, PodcastMediaInformationSchema } from 'src/entities/PodcastMediaInformation.entity';
import { VideoMediaInformation, VideoMediaInformationSchema } from 'src/entities/VideoMediaInformation.entity';
import { CategoryInformation, CategoryInformationSchema } from 'src/entities/categoryInformation.entity';
import { ErrorLogInformation, ErrorLogInformationSchema } from 'src/entities/errorLogInformation.entity';
import { MediaSyncScheduler } from './media-sync.scheduler';


@Module({
    imports: [
        ScheduleModule.forRoot(),
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
        MongooseModule.forFeature([
            { name: AudioMediaInformation.name, schema: AudioMediaInformationSchema },
            { name: PodcastMediaInformation.name, schema: PodcastMediaInformationSchema },
            { name: VideoMediaInformation.name, schema: VideoMediaInformationSchema },
            { name: CategoryInformation.name, schema: CategoryInformationSchema },
            { name: ErrorLogInformation.name, schema: ErrorLogInformationSchema },
        ]),
    ],
    controllers: [MediaSyncController],
    providers: [MediaSyncService, MediaSyncScheduler],
    exports: [MediaSyncService],
})
export class MediaSyncModule { }