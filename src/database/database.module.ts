import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DatabaseService } from './database.service';
import { DatabaseHealthIndicator } from './database.health';
import { DatabaseExceptionFilter } from './exceptions/database-exception.filter';
import { DatabaseLoggingInterceptor } from './database-logging.interceptor';
import databaseConfig from '../config/database.config';

@Global()
@Module({
    imports: [
        ConfigModule.forFeature(databaseConfig),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const config = configService.get('database');
                return {
                    uri: config.uri,
                    ...config.options,
                    connectionFactory: (connection) => {
                        // connection.plugin(require('mongoose-lean-virtuals'));
                        return connection;
                    },
                };
            },
            inject: [ConfigService],
        }),
        TerminusModule,
    ],
    providers: [
        DatabaseService,
        DatabaseHealthIndicator,
        {
            provide: APP_FILTER,
            useClass: DatabaseExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: DatabaseLoggingInterceptor,
        },
    ],
    exports: [DatabaseService, DatabaseHealthIndicator, MongooseModule, ],
})
export class DatabaseModule { }