"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const errorHandler_1 = require("../../../middleware/errorHandler");
const authenticateToken = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            throw (0, errorHandler_1.createError)("No token provided", 401);
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw (0, errorHandler_1.createError)("JWT_SECRET is not defined in environment variables", 500);
        }
        let decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await user_model_1.UserModel.findById(decoded.userId).select('-password');
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 400);
        }
        if (!user.isActive) {
            throw (0, errorHandler_1.createError)('User account is deactivated', 401);
        }
        request.user = user;
    }
    catch (error) {
        if (error.name === 'jsonWebTokenError') {
            throw (0, errorHandler_1.createError)('Invalid token', 401);
        }
        else if (error.name === 'TokenExpiredError') {
            throw (0, errorHandler_1.createError)('Token has expired', 401);
        }
        else {
            throw error;
        }
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw (0, errorHandler_1.createError)("JWT_SECRET is not defined in environment variables", 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await user_model_1.UserModel.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
            request.user = user;
        }
    }
    catch (error) {
    }
};
exports.optionalAuth = optionalAuth;
const requireAdmin = async (request, reply) => {
    if (!request.user || request.user.role !== 'admin') {
        throw (0, errorHandler_1.createError)('Admin privileges required', 403);
    }
};
exports.requireAdmin = requireAdmin;
