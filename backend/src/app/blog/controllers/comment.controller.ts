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

export const getPostComments = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { postId } = request.params as { postId: string};
        const comments = await CommentService.getPostComments(postId);
        
        reply.status(200).send({
            success: true,
            data: comments
        });
    } catch (error) {
        throw error;
    }
};

export const getCommentById = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params as { id: string};
        const commnet = await CommentService.getCommentById(id);
        
        reply.status(200).send({
            success: true,
            data: commnet
        });
    } catch (error) {
        throw error;
    }
};

export const updateComment = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params as { id: string };
        const updateData = request.body as UpdateCommentData;

        const updatedComment = await CommentService.updateComment(id, authorId, updateData);
        
        reply.status(200).send({
            success: true,
            data: updatedComment
        });
    } catch (error) {
        throw error;
    }
};

export const deleteComment = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params as { id: string };

        await CommentService.deleteComment(id, authorId);
        
        reply.status(200).send({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        throw error;
    }
};

export const likeComment = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user._id.toString();
        const { id } = request.params as { id: string };

        const updatedComment = await CommentService.likeComment(id, userId);
        
        reply.status(200).send({
            success: true,
            data: updatedComment
        });
    } catch (error) {
        throw error;
    }
};
