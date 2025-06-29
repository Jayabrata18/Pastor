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
        privateLogger.info('Media sync completed successfully', { context: 'MediaSyncController.syncMedia' });
        return { message: 'Media sync completed successfully' };
    }



    @Delete('delete/all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all media data (videos, audio, podcasts)' })
    @ApiResponse({ status: 200, description: 'All media data deleted successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error during deletion' })
    async deleteAllMediaData() {
        privateLogger.info('Received request to delete all media data',{context: 'MediaSyncController.deleteAllMediaData'});

        try {
            await this.mediaSyncService.deleteAllMediaData();
            return {
                success: true,
                message: 'All media data deleted successfully',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            privateLogger.error('Error deleting all media data:', error, {context: 'MediaSyncController.deleteAllMediaData'});
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