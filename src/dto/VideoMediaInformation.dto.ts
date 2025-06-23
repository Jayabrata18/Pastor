import { IsOptional, IsString, IsNumber, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVideoMediaInformationDto {
    @ApiProperty({
        description: 'Unique media identifier',
        example: 12345
    })
    @IsNotEmpty()
    @IsNumber()
    mediaID: number;

    @ApiPropertyOptional({
        description: 'Title of the video',
        example: 'Sunday Service - The Power of Prayer'
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the video content',
        example: 'A powerful message about the importance of prayer in our daily lives, delivered during our Sunday morning service.'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the video thumbnail/poster image',
        example: 'https://example.com/images/video-thumbnail.jpg'
    })
    @IsOptional()
    @IsString()
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the video file',
        example: 'https://example.com/videos/sunday-service-prayer.mp4'
    })
    @IsOptional()
    @IsString()
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Speaker, pastor, or content creator name',
        example: 'Pastor Michael Brown'
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({
        description: 'Type or category of video content',
        example: 'service',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the video content',
        example: 'English',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    language?: string;

    @ApiPropertyOptional({
        description: 'User who created this record',
        example: 'admin',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    createdBy?: string;

    @ApiPropertyOptional({
        description: 'User who last modified this record',
        example: 'editor',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    modifiedBy?: string;
}

export class UpdateVideoMediaInformationDto extends PartialType(CreateVideoMediaInformationDto) {
    @ApiPropertyOptional({
        description: 'User who modified this record',
        example: 'editor',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    modifiedBy?: string;
}

export class VideoMediaInformationResponseDto {
    @ApiProperty({
        description: 'MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
    })
    _id: string;

    @ApiProperty({
        description: 'Unique media identifier',
        example: 12345
    })
    mediaID: number;

    @ApiPropertyOptional({
        description: 'Title of the video',
        example: 'Sunday Service - The Power of Prayer'
    })
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the video content',
        example: 'A powerful message about the importance of prayer in our daily lives, delivered during our Sunday morning service.'
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the video thumbnail/poster image',
        example: 'https://example.com/images/video-thumbnail.jpg'
    })
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the video file',
        example: 'https://example.com/videos/sunday-service-prayer.mp4'
    })
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Speaker, pastor, or content creator name',
        example: 'Pastor Michael Brown'
    })
    author?: string;

    @ApiPropertyOptional({
        description: 'Type or category of video content',
        example: 'service'
    })
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the video content',
        example: 'English'
    })
    language?: string;

    @ApiPropertyOptional({
        description: 'User who created this record',
        example: 'admin'
    })
    createdBy?: string;

    @ApiProperty({
        description: 'Date when record was created',
        example: '2024-01-15T10:30:00Z'
    })
    createdDate: Date;

    @ApiPropertyOptional({
        description: 'User who last modified this record',
        example: 'editor'
    })
    modifiedBy?: string;

    @ApiProperty({
        description: 'Date when record was last modified',
        example: '2024-01-16T14:45:00Z'
    })
    modifiedDate: Date;
}