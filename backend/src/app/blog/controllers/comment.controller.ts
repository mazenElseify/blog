import type { FastifyRequest, FastifyReply } from 'fastify';
import { CommentService, CreateCommentData, UpdateCommentData } from '../services/comment.service';

interface CreateCommentrequest {
    Body: CreateCommentData;
}

interface UpdateCommentRequest {
    Body: UpdateCommentData;
    params: { id: string };
}

interface getPostCommentsRequest {
    params: { postId: string };
}

interface getCommentRequest {
    params: { id: string };
}

export const createComment = async (
    request: FastifyRequest,
    reply: FastifyReply 
) => {
    try {
        const authorId = request.user._id.toString();

        const comment = await CommentService.createComment(authorId, request.body as CreateCommentData);
        reply.status(201).send({
            success: true,
            data: comment
        });
    } catch (error) {
        throw error;
    }
};
