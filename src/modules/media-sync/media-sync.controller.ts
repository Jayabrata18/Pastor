import { Controller, Post, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MediaSyncService } from './media-sync.service';

@ApiTags('Media Sync')
@Controller('media-sync')
export class MediaSyncController {
    constructor(private readonly mediaSyncService: MediaSyncService) { }

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Manually trigger media sync' })
    @ApiResponse({ status: 200, description: 'Sync completed successfully' })
    async syncMedia(): Promise<{ message: string }> {
        await this.mediaSyncService.syncMediaData();
        return { message: 'Media sync completed successfully' };
    }

    @Delete('all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all media data from database' })
    @ApiResponse({ status: 200, description: 'All media data deleted successfully' })
    async deleteAllMedia(): Promise<{ message: string }> {
        await this.mediaSyncService.deleteAllMediaData();
        return { message: 'All media data deleted successfully' };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get media statistics' })
    @ApiResponse({ status: 200, description: 'Media statistics retrieved successfully' })
    async getStats(): Promise<any> {
        return await this.mediaSyncService.getMediaStats();
    }
}