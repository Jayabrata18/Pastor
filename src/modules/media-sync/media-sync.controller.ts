import { Controller, Post, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MediaSyncService } from './media-sync.service';
import privateLogger from 'src/log/logger';

@ApiTags('Media Sync')
@Controller('media-sync')
export class MediaSyncController {
    constructor(private readonly mediaSyncService: MediaSyncService) { }

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Manually trigger media sync' })
    @ApiResponse({ status: 200, description: 'Sync completed successfully' })
    async syncMedia(): Promise<{ message: string }> {
        await this.mediaSyncService.syncAllMediaData();
        return { message: 'Media sync completed successfully' };
    }

    // @Delete('content')
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: 'Delete all media content from database' })
    // @ApiResponse({ status: 200, description: 'All media content deleted successfully' })
    // async deleteAllMediaContent(): Promise<{ message: string }> {
    //     const result = await this.mediaSyncService.deleteAllMediaData();
    //     privateLogger.info(`All media content deleted successfully: ${result.deletedCount} items removed`);
    //     if (result.deletedCount === 0) {
    //         return { message: 'No media content found to delete' };
    //     }
    //     return { message: `All media content deleted successfully: ${result.deletedCount} items removed` };
    // }

    @Delete('delete/all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all media data (videos, audio, podcasts)' })
    @ApiResponse({ status: 200, description: 'All media data deleted successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error during deletion' })
    async deleteAllMediaData() {
        privateLogger.info('Received request to delete all media data');

        try {
            await this.mediaSyncService.deleteAllMediaData();
            return {
                success: true,
                message: 'All media data deleted successfully',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            privateLogger.error('Error deleting all media data:', error);
            throw error;
        }
    }    



    @Get('stats')
    @ApiOperation({ summary: 'Get media statistics' })
    @ApiResponse({ status: 200, description: 'Media statistics retrieved successfully' })
    async getStats(): Promise<any> {
        return await this.mediaSyncService.getMediaStats();
    }
}