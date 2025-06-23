import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AudioMediaModule } from './modules/audio-media/audio-media.module';
import { VideoMediaModule } from './modules/video-media/video-media.module';
import { PodcastMediaModule } from './modules/podcast-media/podcast-media.module';
import { ErrorLogModule } from './modules/error-log-info/error-log-info.module';
import privateLogger from './log/logger';
import { CategoryInformation } from './entities/categoryInformation.entity';
import { MediaSyncModule } from './modules/media-sync/media-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    // Logger Module
    WinstonModule.forRoot(privateLogger),
    AudioMediaModule,
    VideoMediaModule,
    PodcastMediaModule,
    CategoryInformation,
    ErrorLogModule,
    MediaSyncModule,

  ], controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
