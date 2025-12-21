import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { createError } from '../../../middleware/errorHandler';

interface JwtPayload {
    userId: string;
    iat?: number;
    expt?: number;
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: any;
    }
}

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw createError("No token provided", 401);
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw createError("JWT_SECRET is not defined in environment variables", 500);
        }

        let decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const user = await UserModel.findById(decoded.userId).select('-password');
        if(!user) {
            throw createError('User not found', 400);
        }

        if (!user.isActive) {
            throw createError('User account is deactivated', 401);
        }
        request.user = user;
    } catch (error: any) {
        if (error.name === 'jsonWebTokenError') {
            throw createError('Invalid token', 401);
        } else if (error.name === 'TokenExpiredError') {
            throw createError('Token has expired', 401);
        } else {
            throw error;
        }
    }
};

export const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw createError("JWT_SECRET is not defined in environment variables", 500);
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const user = await UserModel.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
            request.user = user;
        }
    } catch (error) {
    
    }
};


export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || request.user.role !== 'admin') {
        throw createError('Admin privileges required', 403);
    }
};