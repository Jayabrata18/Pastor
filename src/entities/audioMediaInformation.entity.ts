import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AudioMediaInformationDocument = AudioMediaInformation & Document;

@Schema({
    collection: 'audioMediaInformation',
    timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' }
})
export class AudioMediaInformation {
    @Prop({ type: Types.ObjectId, auto: true })
    id: Types.ObjectId;

    @Prop({ required: true, unique: true })
    mediaID: number;

    @Prop({ required: false })
    title?: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: false })
    mediaImage?: string;

    @Prop({ required: false, unique: true })
    mediaLink?: string;

    @Prop({ required: false })
    author?: string;

    @Prop({ required: false, maxlength: 50 })
    type?: string;

    @Prop({ required: false, maxlength: 50 })
    language?: string;

    @Prop({ required: false })
    categories?: string[];


    @Prop({ required: false, maxlength: 50 })
    createdBy?: string;

    @Prop({ type: Date, default: Date.now })
    createdDate?: Date;

    @Prop({ required: false, maxlength: 50 })
    modifiedBy?: string;

    @Prop({ type: Date, default: Date.now })
    modifiedDate?: Date;
}

export const AudioMediaInformationSchema = SchemaFactory.createForClass(AudioMediaInformation);