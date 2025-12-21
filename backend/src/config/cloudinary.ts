import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadOptions = {
    avatar:{
        folder: 'blog/avatars',
        width: 200,
        height: 200,
        crop: 'fill',
        format: 'jpg',
        quality: 'auto'
    },
    coverImage: {
        folder: 'blog/covers',
        width: 1200,
        height: 600,
        crop: 'fill',
        format: 'jpg',
        quality: 'auto'
    },
    postImage: {
        folder: 'blog/posts',
        width: 800,
        format: 'jpg',
        quality: 'auto'
    }
};

export default cloudinary;