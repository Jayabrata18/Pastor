import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastMediaInformation, PodcastMediaInformationSchema } from 'src/entities/PodcastMediaInformation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PodcastMediaInformation.name, schema: PodcastMediaInformationSchema }
        ])
    ],
    // controllers: [PodcastMediaController],
    // providers: [PodcastMediaService],
    // exports: [PodcastMediaService]
})
export class PodcastMediaModule { }