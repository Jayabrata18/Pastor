import { IsOptional, IsString, IsNumber, MaxLength, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePodcastMediaInformationDto {

    @ApiProperty({
        description: 'External API ID',
        example: '1434t456'
    })
    id: string;

    @ApiProperty({
        description: 'Unique media identifier',
        example: 12345
    })
    @IsNotEmpty()
    @IsNumber()
    mediaID: number;

    @ApiPropertyOptional({
        description: 'Title of the podcast episode',
        example: 'Faith and Modern Life - Episode 15'
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the podcast episode',
        example: 'In this episode, we explore how faith intersects with modern technology and social media.'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the podcast cover image',
        example: 'https://example.com/images/podcast-episode-15.jpg'
    })
    @IsOptional()
    @IsString()
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the podcast audio file',
        example: 'https://example.com/podcasts/episode-15.mp3'
    })
    @IsOptional()
    @IsString()
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Host, speaker, or author name',
        example: 'Pastor Sarah Johnson'
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({
        description: 'Type or category of podcast',
        example: 'sermon',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the podcast content',
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

export class UpdatePodcastMediaInformationDto extends PartialType(CreatePodcastMediaInformationDto) {
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

export class PodcastMediaInformationResponseDto {
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
        description: 'Title of the podcast episode',
        example: 'Faith and Modern Life - Episode 15'
    })
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the podcast episode',
        example: 'In this episode, we explore how faith intersects with modern technology and social media.'
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the podcast cover image',
        example: 'https://example.com/images/podcast-episode-15.jpg'
    })
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the podcast audio file',
        example: 'https://example.com/podcasts/episode-15.mp3'
    })
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Host, speaker, or author name',
        example: 'Pastor Sarah Johnson'
    })
    author?: string;

    @ApiPropertyOptional({
        description: 'Type or category of podcast',
        example: 'sermon'
    })
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the podcast content',
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