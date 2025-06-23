import { IsOptional, IsString, IsNumber, IsDate, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAudioMediaInformationDto {

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
        description: 'Title of the audio media',
        example: 'Sunday Morning Sermon'
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the audio media',
        example: 'A powerful sermon about faith and hope'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the media image',
        example: 'https://example.com/images/sermon.jpg'
    })
    @IsOptional()
    @IsString()
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the audio file',
        example: 'https://example.com/audio/sermon.mp3'
    })
    @IsOptional()
    @IsString()
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Author or speaker name',
        example: 'Pastor John Smith'
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({
        description: 'Type of media content',
        example: 'sermon',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the content',
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

export class UpdateAudioMediaInformationDto extends PartialType(CreateAudioMediaInformationDto) {
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

export class AudioMediaInformationResponseDto {
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
        description: 'Title of the audio media',
        example: 'Sunday Morning Sermon'
    })
    title?: string;

    @ApiPropertyOptional({
        description: 'Description of the audio media',
        example: 'A powerful sermon about faith and hope'
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the media image',
        example: 'https://example.com/images/sermon.jpg'
    })
    mediaImage?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the audio file',
        example: 'https://example.com/audio/sermon.mp3'
    })
    mediaLink?: string;

    @ApiPropertyOptional({
        description: 'Author or speaker name',
        example: 'Pastor John Smith'
    })
    author?: string;

    @ApiPropertyOptional({
        description: 'Type of media content',
        example: 'sermon'
    })
    type?: string;

    @ApiPropertyOptional({
        description: 'Language of the content',
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