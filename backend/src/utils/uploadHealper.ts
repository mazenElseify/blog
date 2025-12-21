import cloudinary, { uploadOptions } from '../config/cloudinary';
import {createError} from '../middleware/errorHandler';

export interface UploadResult {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
}

export const uploadImageToCloudinary = async (
    imageBuffer: Buffer,
    type: 'avatar' | 'coverImage' | 'postImage'
): Promise<UploadResult> => {
    try {
        return new Promise<UploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions[type],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                            width: result.width,
                            height: result.height,
                            format: result.format
                        });
                    }
                }
            );

            uploadStream.end(imageBuffer);
        });
    } catch (error) {
        throw createError('Image upload failed', 500);
    }
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch(error) {
        throw createError('Image deletion failed', 500);
    }
};

export const validateImageFile = (file: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw createError('Invalid image type. Allowed types are JPEG, PNG, GIF, WEBP.', 400);
    }
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        throw createError('Image size exceeds the maximum limit of 5MB.', 400);
    }
};

