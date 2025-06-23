import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PodcastMediaInformationDocument = PodcastMediaInformation & Document;

@Schema({
    collection: 'podcastMediaInformation',
    timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' }
})
export class PodcastMediaInformation {
    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true, unique: true })
    mediaID: number;

    @Prop({ required: false })
    title?: string;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: false })
    mediaImage?: string;

    @Prop({ required: false })
    mediaLink?: string;

    @Prop({ required: false })
    author?: string;

    @Prop({ required: false, maxlength: 50 })
    type?: string;

    @Prop({ required: false, maxlength: 50 })
    language?: string;

    @Prop({ required: false, maxlength: 50 })
    createdBy?: string;

    @Prop({ type: Date, default: Date.now })
    createdDate?: Date;

    @Prop({ required: false, maxlength: 50 })
    modifiedBy?: string;

    @Prop({ type: Date, default: Date.now })
    modifiedDate?: Date;
}

export const PodcastMediaInformationSchema = SchemaFactory.createForClass(PodcastMediaInformation);