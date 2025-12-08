import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Model3D from '@/models/Model3D';
import { uploadModelToCloudinary } from '@/lib/cloudinarySecondary';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        const query: any = {};
        if (type && type !== 'all') {
            query.type = type;
        }

        const models = await Model3D.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: models });
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const thumbnailFile = formData.get('thumbnail') as File | null;
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        const uploadResult = await uploadModelToCloudinary(file);

        let thumbnailData: { url: string; publicId: string } | null = null;
        if (thumbnailFile) {
            const { uploadImageToCloudinary } = await import('@/lib/cloudinarySecondary');
            thumbnailData = await uploadImageToCloudinary(thumbnailFile);
        }

        const newModel = await Model3D.create({
            name,
            type: type || 'other',
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            ...(thumbnailData && {
                thumbnailUrl: thumbnailData.url,
                thumbnailPublicId: thumbnailData.publicId,
            }),
        });

        return NextResponse.json({ success: true, data: newModel }, { status: 201 });
    } catch (error) {
        console.error('Error uploading model:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload model' },
            { status: 500 }
        );
    }
}
