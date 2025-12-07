import type {FastifyRequest, FastifyReply} from 'fastify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../../user/database/models/user.model';
import { createError } from '../../../middleware/errorHandler';

interface RegisterBody {
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

const generateToken = (userId: string): string => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    
    // Get expiration time from env or default to 7 days
    const expirationTime = process.env.JWT_EXPIRES_IN || '7d';
    
    return jwt.sign(
        { userId },
        jwtSecret,
        { expiresIn: expirationTime } as SignOptions
    );
};

export const register = async ( request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply ) => {
    try {
        const { username, email, password, bio, avatar } = request.body;

        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            throw createError(`User with this ${field} already exists`, 400);
        }

        const user = new UserModel({
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
                token}
            });



} catch (error: any ) {
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw createError(`User with this ${field} already exists`, 400);
    }
    throw error;
}
};

export const login = async ( request: FastifyRequest<{ Body: LoginBody }> , reply: FastifyReply) => {
    try {
        const { email, password } = request.body;
        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) {
            throw createError("Invalid email or password", 401);
        }

        if (!user.isActive) {
            throw createError("User account is deactivated", 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw createError("Invalid email or password", 401);
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
    } catch (error) {
        throw error;
    }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
        success: true,
        message: "Loged out successfully."
    });
};