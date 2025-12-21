"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
async function authRoutes(fastify, option) {
    fastify.post('/register', {
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
    }, auth_controller_1.register);
    fastify.post('/login', {
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
    }, auth_controller_1.login);
    fastify.post('/logout', auth_controller_1.logout);
    fastify.get('/me', {
        preHandler: [auth_middleware_1.authenticateToken]
    }, auth_controller_1.me);
    // Update user profile
    fastify.put('/profile', {
        preHandler: [auth_middleware_1.authenticateToken],
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
    }, auth_controller_1.updateProfile);
    // Get all users
    fastify.get('/users', {
        preHandler: [auth_middleware_1.authenticateToken]
    }, auth_controller_1.getAllUsers);
    // Get user by ID
    fastify.get('/users/:id', {
        preHandler: [auth_middleware_1.authenticateToken],
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
    }, auth_controller_1.getUserById);
}
