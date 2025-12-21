import {uploadAvatar} from '../controllers/auth.controller';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { register, login, logout, me, updateProfile, getAllUsers, getUserById } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

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

interface UpdateProfileBody {
    username?: string;
    bio?: string;
    avatar?: string;
}

interface UserParams {
    id: string;
}

export default async function authRoutes(fastify: FastifyInstance, option: FastifyPluginOptions) {

    fastify.post<{ Body: RegisterBody }>('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 30
                    },
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    password: {
                        type: 'string',
                        minLength: 6
                    },
                    bio: {
                        type: 'string',
                        maxLength: 160
                    },
                    avatar: {
                        type: 'string',
                        format: 'uri'
                    }
                }
            }
        }
    }, register);

    fastify.post<{ Body: LoginBody }>('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    password: {
                        type: 'string',
                        minLength: 6
                    }
                }
            }
        }
    }, login);

    fastify.post('/upload-avatar', {
        preHandler: [authenticateToken],
    }, uploadAvatar);

    fastify.post('/logout', logout);

    fastify.get('/me', {
        preHandler: [authenticateToken]
    }, me);

    // Update user profile
    fastify.put<{ Body: UpdateProfileBody }>('/profile', {
        preHandler: [authenticateToken],
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 30
                    },
                    bio: {
                        type: 'string',
                        maxLength: 160
                    },
                    avatar: {
                        type: 'string',
                        format: 'uri'
                    }
                }
            }
        }
    }, updateProfile);

    // Get all users
    fastify.get('/users', {
        
        preHandler: [authenticateToken]
    }, getAllUsers);

    // Get user by ID
    fastify.get<{ Params: UserParams }>('/users/:id', {
        preHandler: [authenticateToken],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        pattern: '^[0-9a-fA-F]{24}$'
                    }
                }
            }
        }
    }, getUserById);
}

