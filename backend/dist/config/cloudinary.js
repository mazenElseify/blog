"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOptions = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
exports.uploadOptions = {
    avatar: {
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
exports.default = cloudinary_1.v2;
