"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
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
}
