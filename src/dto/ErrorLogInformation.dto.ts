import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateErrorLogInformationDto {
    @ApiPropertyOptional({
        description: 'Detailed error information',
        example: 'Database connection failed: Connection timeout after 30 seconds'
    })
    @IsOptional()
    @IsString()
    errorInformation?: string;

    @ApiPropertyOptional({
        description: 'Page or route where error occurred',
        example: '/api/v1/audio-media'
    })
    @IsOptional()
    @IsString()
    pageName?: string;

    @ApiPropertyOptional({
        description: 'Event or action that triggered the error',
        example: 'CREATE_AUDIO_MEDIA'
    })
    @IsOptional()
    @IsString()
    eventName?: string;

    @ApiPropertyOptional({
        description: 'User who was performing the action when error occurred',
        example: 'user123',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    createdBy?: string;

    @ApiPropertyOptional({
        description: 'User who last modified this record',
        example: 'admin',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    modifiedBy?: string;
}

export class UpdateErrorLogInformationDto extends PartialType(CreateErrorLogInformationDto) {
    @ApiPropertyOptional({
        description: 'User who modified this record',
        example: 'admin',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    modifiedBy?: string;
}

export class ErrorLogInformationResponseDto {
    @ApiProperty({
        description: 'MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
    })
    _id: string;

    @ApiPropertyOptional({
        description: 'Detailed error information',
        example: 'Database connection failed: Connection timeout after 30 seconds'
    })
    errorInformation?: string;

    @ApiPropertyOptional({
        description: 'Page or route where error occurred',
        example: '/api/v1/audio-media'
    })
    pageName?: string;

    @ApiPropertyOptional({
        description: 'Event or action that triggered the error',
        example: 'CREATE_AUDIO_MEDIA'
    })
    eventName?: string;

    @ApiPropertyOptional({
        description: 'User who was performing the action when error occurred',
        example: 'user123'
    })
    createdBy?: string;

    @ApiProperty({
        description: 'Date when error was logged',
        example: '2024-01-15T10:30:00Z'
    })
    createdDate: Date;

    @ApiPropertyOptional({
        description: 'User who last modified this record',
        example: 'admin'
    })
    modifiedBy?: string;

    @ApiProperty({
        description: 'Date when record was last modified',
        example: '2024-01-16T14:45:00Z'
    })
    modifiedDate: Date;
}