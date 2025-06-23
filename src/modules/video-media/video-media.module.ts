import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoMediaInformation, VideoMediaInformationSchema } from 'src/entities/VideoMediaInformation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: VideoMediaInformation.name, schema: VideoMediaInformationSchema }
        ])
    ],
    // controllers: [VideoMediaController],
    // providers: [VideoMediaService],
    // exports: [VideoMediaService]
})
export class VideoMediaModule { }