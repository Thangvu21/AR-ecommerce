import { v2 as cloudinary } from 'cloudinary';

// Config Secondary Cloudinary Account
const cloudinarySecondary = cloudinary;

cloudinarySecondary.config({
    cloud_name: process.env.CLOUDINARY_SECONDARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_SECONDARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECONDARY_API_SECRET,
});

export const CLOUDINARY_SECONDARY_FOLDERS = {
    MODELS: 'mandala/models',
} as const;

export const uploadModelToCloudinary = async (
    file: File | string,
    folder: string = CLOUDINARY_SECONDARY_FOLDERS.MODELS
): Promise<{ url: string; publicId: string }> => {
    try {
        let uploadData: string;

        if (file instanceof File) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            // For 3D models, we might need to handle them differently than images if they are large,
            // but for "simple" implementation, base64 might suffice for small files.
            // However, Cloudinary supports raw uploads.
            uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
        } else {
            uploadData = file;
        }

        const timestamp = Date.now();
        // Simple naming strategy
        const publicId = `model-${timestamp}`;

        const result = await cloudinarySecondary.uploader.upload(uploadData, {
            folder: folder,
            public_id: publicId,
            resource_type: 'auto', // Important for 3D files (.glb, .gltf)
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary secondary upload error:', error);
        throw new Error('Failed to upload model to secondary Cloudinary account');
    }
};

export const uploadImageToCloudinary = async (
    file: File | string,
    folder: string = CLOUDINARY_SECONDARY_FOLDERS.MODELS
): Promise<{ url: string; publicId: string }> => {
    try {
        let uploadData: string;

        if (file instanceof File) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
        } else {
            uploadData = file;
        }

        const timestamp = Date.now();
        const publicId = `thumbnail-${timestamp}`;

        const result = await cloudinarySecondary.uploader.upload(uploadData, {
            folder: folder,
            public_id: publicId,
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill' },
                { quality: 'auto' },
            ],
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary thumbnail upload error:', error);
        throw new Error('Failed to upload thumbnail to secondary Cloudinary account');
    }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinarySecondary.uploader.destroy(publicId, {
            resource_type: 'auto',
            invalidate: true,
        });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Don't throw error - allow update to continue even if delete fails
    }
};


export default cloudinarySecondary;

