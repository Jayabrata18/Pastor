import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryInformation, CategoryInformationSchema } from 'src/entities/categoryInformation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CategoryInformation.name, schema: CategoryInformationSchema }
        ])
    ],
    // controllers: [CategoryController],
    // providers: [CategoryService],
    // exports: [CategoryService]
})
export class CategoryModule { }
