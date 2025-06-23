import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ErrorLogInformationDocument = ErrorLogInformation & Document;

@Schema({
    collection: 'errorLogInformation',
    timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' }
})
export class ErrorLogInformation {
    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: false })
    errorInformation?: string;

    @Prop({ required: false })
    pageName?: string;

    @Prop({ required: false })
    eventName?: string;

    @Prop({ required: false, maxlength: 50 })
    createdBy?: string;

    @Prop({ type: Date, default: Date.now })
    createdDate?: Date;

    @Prop({ required: false, maxlength: 50 })
    modifiedBy?: string;

    @Prop({ type: Date, default: Date.now })
    modifiedDate?: Date;
}

export const ErrorLogInformationSchema = SchemaFactory.createForClass(ErrorLogInformation);