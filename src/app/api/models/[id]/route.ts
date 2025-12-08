import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Model3D from '@/models/Model3D';
import { uploadModelToCloudinary, uploadImageToCloudinary, deleteFromCloudinary } from '@/lib/cloudinarySecondary';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        const existingModel = await Model3D.findById(id);
        if (!existingModel) {
            return NextResponse.json(
                { success: false, error: 'Model not found' },
                { status: 404 }
            );
        }

        const formData = await req.formData();
        const name = formData.get('name') as string | null;
        const type = formData.get('type') as string | null;
        const newModelFile = formData.get('file') as File | null;
        const newThumbnailFile = formData.get('thumbnail') as File | null;

        const updateData: any = {};

        if (name) {
            updateData.name = name;
        }

        if (type) {
            updateData.type = type;
        }

        if (newModelFile) {
            if (existingModel.publicId) {
                await deleteFromCloudinary(existingModel.publicId);
            }

            const uploadResult = await uploadModelToCloudinary(newModelFile);
            updateData.url = uploadResult.url;
            updateData.publicId = uploadResult.publicId;
        }

        if (newThumbnailFile) {
            if (existingModel.thumbnailPublicId) {
                await deleteFromCloudinary(existingModel.thumbnailPublicId);
            }

            const thumbnailResult = await uploadImageToCloudinary(newThumbnailFile);
            updateData.thumbnailUrl = thumbnailResult.url;
            updateData.thumbnailPublicId = thumbnailResult.publicId;
        }

        const updatedModel = await Model3D.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: updatedModel });
    } catch (error) {
        console.error('Error updating model:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update model' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        // Check if model exists
        const existingModel = await Model3D.findById(id);
        if (!existingModel) {
            return NextResponse.json(
                { success: false, error: 'Model not found' },
                { status: 404 }
            );
        }

        // Delete files from Cloudinary
        if (existingModel.publicId) {
            await deleteFromCloudinary(existingModel.publicId);
        }
        if (existingModel.thumbnailPublicId) {
            await deleteFromCloudinary(existingModel.thumbnailPublicId);
        }

        // Delete from database
        await Model3D.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Model deleted successfully' });
    } catch (error) {
        console.error('Error deleting model:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete model' },
            { status: 500 }
        );
    }
}
