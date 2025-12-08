import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IModel3D extends Document {
    name: string;
    type: 'glasses' | 'hat' | 'other';
    url: string;
    publicId: string;
    thumbnailUrl?: string;
    thumbnailPublicId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const Model3DSchema: Schema<IModel3D> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name for the model'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['glasses', 'hat', 'other'],
            default: 'other',
            required: true,
        },
        url: {
            type: String,
            required: [true, 'Please provide the model URL'],
        },
        publicId: {
            type: String,
            required: [true, 'Please provide the Cloudinary public ID'],
        },
        thumbnailUrl: {
            type: String,
        },
        thumbnailPublicId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Model3D: Model<IModel3D> =
    mongoose.models.Model3D || mongoose.model<IModel3D>('Model3D', Model3DSchema);

export default Model3D;
