"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = postRoutes;
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../../auth/middleware/auth.middleware");
async function postRoutes(fastify, options) {
    // GET /api/posts - Get all posts
    fastify.get('/', {
        preHandler: [
            auth_middleware_1.optionalAuth
        ]
    }, post_controller_1.getAllPosts);
    // GET /api/posts/my/posts - Get posts of authenticated user
    fastify.get('/my/posts', {
        preHandler: [
            auth_middleware_1.authenticateToken
        ]
    }, post_controller_1.getUserPosts);
    // GET /api/posts/:id - Get post by ID
    fastify.get('/:id', {
        preHandler: [
            auth_middleware_1.optionalAuth
        ]
    }, post_controller_1.getPostById);
    // POST /api/posts - Create a new post
    fastify.post('/', {
        preHandler: [
            auth_middleware_1.authenticateToken
        ]
    }, post_controller_1.createPost);
    // PUT /api/posts/:id - Update a post
    fastify.put('/:id', {
        preHandler: [
            auth_middleware_1.authenticateToken
        ]
    }, post_controller_1.updatePost);
    // DELETE /api/posts/:id - Delete a post
    fastify.delete('/:id', {
        preHandler: [
            auth_middleware_1.authenticateToken
        ]
    }, post_controller_1.deletePost);
    // POST /api/posts/:id/like - Like or unlike a post
    fastify.post('/:id/like', {
        preHandler: [
            auth_middleware_1.authenticateToken
        ]
    }, post_controller_1.likePost);
}
