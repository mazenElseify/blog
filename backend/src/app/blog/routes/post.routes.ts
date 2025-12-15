import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    getUserPosts
} from '../controllers/post.controller';
import { authenticateToken, optionalAuth } from '../../auth/middleware/auth.middleware';

export default async function postRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // GET /api/posts - Get all posts
    fastify.get('/', {
        preHandler: [
            optionalAuth
        ]
    }, getAllPosts);
    
    // GET /api/posts/my/posts - Get posts of authenticated user
    fastify.get('/my/posts', {
        preHandler: [
            authenticateToken
        ]
    }, getUserPosts);

    // GET /api/posts/:id - Get post by ID
    fastify.get('/:id', {
        preHandler: [
            optionalAuth
        ]
    }, getPostById);

    // POST /api/posts - Create a new post
    fastify.post('/', {
        preHandler: [
            authenticateToken
        ]
    }, createPost);

    // PUT /api/posts/:id - Update a post
    fastify.put('/:id', {
        preHandler: [
            authenticateToken
        ]
    }, updatePost);

    // DELETE /api/posts/:id - Delete a post
    fastify.delete('/:id', {
        preHandler: [
            authenticateToken
        ]
    }, deletePost);

    // POST /api/posts/:id/like - Like or unlike a post
    fastify.post('/:id/like', {
        preHandler: [
            authenticateToken
        ]
    }, likePost);
}