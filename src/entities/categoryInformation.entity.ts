import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryInformationDocument = CategoryInformation & Document;

@Schema({
    collection: 'categoryInformation',
    timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' }
})
export class CategoryInformation {
    @Prop({ type: Types.ObjectId, auto: true })
    id: Types.ObjectId;

    @Prop({ required: false })
    mediaID?: number;

    @Prop({ required: false, maxlength: 50 })
    type?: string;

    @Prop({ required: true, maxlength: 50 })
    categoryName: string;

    @Prop({ required: false, maxlength: 50 })
    createdBy?: string;

    @Prop({ type: Date, default: Date.now })
    createdDate?: Date;

    @Prop({ required: false, maxlength: 50 })
    modifiedBy?: string;

    @Prop({ type: Date, default: Date.now })
    modifiedDate?: Date;
}

export const CategoryInformationSchema = SchemaFactory.createForClass(CategoryInformation);