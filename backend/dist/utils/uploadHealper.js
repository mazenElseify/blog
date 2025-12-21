"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageFile = exports.deleteImageFromCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const errorHandler_1 = require("../middleware/errorHandler");
const uploadImageToCloudinary = async (imageBuffer, type) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream(cloudinary_1.uploadOptions[type], (error, result) => {
                if (error) {
                    reject(error);
                }
                else if (result) {
                    resolve({
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        format: result.format
                    });
                }
            });
            uploadStream.end(imageBuffer);
        });
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Image upload failed', 500);
    }
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const deleteImageFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.default.uploader.destroy(publicId);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Image deletion failed', 500);
    }
};
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw (0, errorHandler_1.createError)('Invalid image type. Allowed types are JPEG, PNG, GIF, WEBP.', 400);
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw (0, errorHandler_1.createError)('Image size exceeds the maximum limit of 5MB.', 400);
    }
};
exports.validateImageFile = validateImageFile;
