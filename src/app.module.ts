import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import privateLogger from './log/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    // Logger Module
    WinstonModule.forRoot(privateLogger),
    
  ],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
