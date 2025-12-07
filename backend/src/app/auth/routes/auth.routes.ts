import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { register, login, logout } from '../controllers/auth.controller';

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

    fastify.post('/logout', logout);
}

