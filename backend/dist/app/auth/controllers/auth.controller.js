"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../../user/database/models/user.model");
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
