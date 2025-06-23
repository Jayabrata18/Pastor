import { IsOptional, IsString, IsNumber, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCategoryInformationDto {
    @ApiPropertyOptional({
        description: 'Associated media ID',
        example: 12345
    })
    @IsOptional()
    @IsNumber()
    mediaID?: number;

    @ApiPropertyOptional({
        description: 'Type of category',
        example: 'audio',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    type?: string;

    @ApiProperty({
        description: 'Name of the category',
        example: 'Sermons',
        maxLength: 50
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    categoryName: string;

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

export class UpdateCategoryInformationDto extends PartialType(CreateCategoryInformationDto) {
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

export class CategoryInformationResponseDto {
    @ApiProperty({
        description: 'MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
    })
    _id: string;

    @ApiPropertyOptional({
        description: 'Associated media ID',
        example: 12345
    })
    mediaID?: number;

    @ApiPropertyOptional({
        description: 'Type of category',
        example: 'audio'
    })
    type?: string;

    @ApiProperty({
        description: 'Name of the category',
        example: 'Sermons'
    })
    categoryName: string;

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