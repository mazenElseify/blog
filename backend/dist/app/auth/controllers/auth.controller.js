"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.uploadAvatar = exports.getAllUsers = exports.updateProfile = exports.me = exports.logout = exports.login = exports.register = void 0;
const uploadHealper_1 = require("../../../utils/uploadHealper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const errorHandler_1 = require("../../../middleware/errorHandler");
const generateToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    // Get expiration time from env or default to 7 days
    const expirationTime = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ userId }, jwtSecret, { expiresIn: expirationTime });
};
const register = async (request, reply) => {
    try {
        const { username, email, password, bio, avatar } = request.body;
        const existingUser = await user_model_1.UserModel.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            throw (0, errorHandler_1.createError)(`User with this ${field} already exists`, 400);
        }
        const user = new user_model_1.UserModel({
            username,
            email,
            password,
            bio: bio || '',
            avatar: avatar || ''
        });
        await user.save();
        const token = generateToken(user._id.toString());
        reply.status(201).send({
            success: true,
            message: "User registered successfully,",
            data: {
                newUser: user,
                token
            }
        });
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            throw (0, errorHandler_1.createError)(`User with this ${field} already exists`, 400);
        }
        throw error;
    }
};
exports.register = register;
const login = async (request, reply) => {
    try {
        const { email, password } = request.body;
        const user = await user_model_1.UserModel.findOne({ email }).select('+password');
        if (!user) {
            throw (0, errorHandler_1.createError)("Invalid email or password", 401);
        }
        if (!user.isActive) {
            throw (0, errorHandler_1.createError)("User account is deactivated", 401);
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)("Invalid email or password", 401);
        }
        const token = generateToken(user._id.toString());
        reply.status(200).send({
            success: true,
            message: "User logged in successfully",
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.login = login;
const logout = async (request, reply) => {
    reply.send({
        success: true,
        message: "Loged out successfully."
    });
};
exports.logout = logout;
const me = async (request, reply) => {
    try {
        const user = request.user;
        if (!user) {
            throw (0, errorHandler_1.createError)("User not found", 404);
        }
        reply.status(200).send({
            success: true,
            message: "User profile retrieved successfully",
            data: {
                user
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.me = me;
// Update user profile
const updateProfile = async (request, reply) => {
    try {
        const userId = request.user?._id;
        const { username, bio, avatar } = request.body;
        if (!userId) {
            throw (0, errorHandler_1.createError)("User not authenticated", 401);
        }
        const updateData = {};
        if (username)
            updateData.username = username;
        if (bio !== undefined)
            updateData.bio = bio;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            throw (0, errorHandler_1.createError)("User not found", 404);
        }
        reply.status(200).send({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: updatedUser
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updateProfile = updateProfile;
// Get all users (admin only)
const getAllUsers = async (request, reply) => {
    try {
        const users = await user_model_1.UserModel.find({ isActive: true }).select('-password');
        reply.status(200).send({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users,
                count: users.length
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAllUsers = getAllUsers;
const uploadAvatar = async (request, reply) => {
    try {
        const userId = request.user?._id;
        if (!userId) {
            throw (0, errorHandler_1.createError)("User not authenticated", 401);
        }
        const data = await request.file();
        if (!data) {
            throw (0, errorHandler_1.createError)("No file uploaded", 400);
        }
        (0, uploadHealper_1.validateImageFile)(data);
        const imageBuffer = await data.toBuffer();
        const currentUser = await user_model_1.UserModel.findById(userId);
        const oldAvatarPublicId = currentUser?.avatar ?
            currentUser.avatar.split('/').pop()?.split('.')[0] : null;
        const uploadResult = await (0, uploadHealper_1.uploadImageToCloudinary)(imageBuffer, 'avatar');
        const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(userId, { avatar: uploadResult.secure_url }, { new: true }).select('-password');
        if (oldAvatarPublicId && currentUser?.avatar?.includes('cloudinary')) {
            await (0, uploadHealper_1.deleteImageFromCloudinary)(`blog/avatars/${oldAvatarPublicId}`);
        }
        reply.status(200).send({
            success: true,
            message: "Avatar uploaded successfully",
            data: {
                user: updatedUser,
                imageUrl: uploadResult.secure_url
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.uploadAvatar = uploadAvatar;
// Get user by ID
const getUserById = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = await user_model_1.UserModel.findById(id).select('-password');
        if (!user) {
            throw (0, errorHandler_1.createError)("User not found", 404);
        }
        reply.status(200).send({
            success: true,
            message: "User retrieved successfully",
            data: {
                user
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getUserById = getUserById;
