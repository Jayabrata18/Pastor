import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioMediaInformation, AudioMediaInformationSchema } from 'src/entities/audioMediaInformation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AudioMediaInformation.name, schema: AudioMediaInformationSchema }
        ])
    ],
    // controllers: [AudioMediaController],
    // providers: [AudioMediaService],
    // exports: [AudioMediaService]
})
export class AudioMediaModule { }