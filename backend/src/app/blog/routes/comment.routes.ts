import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
    createComment,
    getPostComments,
    getCommentById,
    updateComment,
    deleteComment,
    likeComment
} from '../controllers/comment.controller';
import { authenticateToken, optionalAuth } from '../../auth/middleware/auth.middleware';

export default async function commentRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // GET /api/comments/post/:postId - Get comments for a specific post
    fastify.get('/post/:postId', {
        preHandler: [optionalAuth]
    }, getPostComments);

    // GET /api/comments/:id - Get comment by ID
    fastify.get('/:id', {
        preHandler: [optionalAuth]
    }, getCommentById);
    
    // POST /api/comments - Create a new comment
    fastify.post('/', {
        preHandler: [authenticateToken]
    }, createComment);

    // PUT /api/comments/:id - Update a comment
    fastify.put('/:id', {
        preHandler: [authenticateToken]
    }, updateComment);

    // DELETE /api/comments/:id - Delete a comment
    fastify.delete('/id', {
        preHandler: [authenticateToken]
    }, deleteComment);
    
    // POST /api/comments/:id/like - Like or unlike a comment
    fastify.post('/:id/like', {
        preHandler: [authenticateToken]
    }, likeComment);
}
