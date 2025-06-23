import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogInformation, ErrorLogInformationSchema } from 'src/entities/errorLogInformation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ErrorLogInformation.name, schema: ErrorLogInformationSchema }
        ])
    ],
    // controllers: [ErrorLogController],
    // providers: [ErrorLogService],
    // exports: [ErrorLogService]
})
export class ErrorLogModule { }