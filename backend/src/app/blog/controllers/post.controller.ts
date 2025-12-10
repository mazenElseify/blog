import type { FastifyRequest, FastifyReply } from 'fastify';
import { PostService, CreatePostData, UpdatePostData, PostQuery } from '../services/post.service';

interface CreatePostRequest {
    Body: CreatePostData;
    Params: { id: string };
}

interface UpdatePostRequest {
    Body: UpdatePostData;
    Params: { id: string };
}

interface GetPostsRequest {
    Querystring: PostQuery;
}

interface GetPostRequest {
    Params: { id: string };
}

interface LikePostRequest {
    Params: { id: string };
}

export const createPost = async (
    request: FastifyRequest<CreatePostRequest>,
    reply: FastifyReply 
) => {
    try {
        const authorId = request.user._id.toString();

        const post = await PostService.createPost(authorId, request.body);

        reply.status(201).send({
            success: true,
            data: post
        });
    } catch (error) {
        throw error;
    }
};

export const getAllPosts = async (
    request: FastifyRequest<GetPostsRequest>,
    reply: FastifyReply
) => {
    try {
        const postsData = await PostService.getAllPosts(request.query);
        
        reply.status(200).send({
            success: true,
            data: postsData,
            message: "Posts retrieved successfully"
        });
    } catch (error) {
        throw error;
    }
};

export const getPostById = async (
    request: FastifyRequest<GetPostRequest>,
    reply: FastifyReply
) => {
    try {
        const post = await PostService.getPostById(request.params.id);

        reply.status(200).send({
            success: true,
            data: post,
            message: "Post retrieved successfully"
        });
    } catch (error) {
        throw error;
    }
};


export const updatePost = async (
    request: FastifyRequest<UpdatePostRequest>,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        const post = await PostService.updatePost(request.params.id, authorId, request.body);

        reply.status(200).send({
            success: true,
            data: post,
            message: "Post updated successfully"
        });
    } catch (error) {
        throw error;
    }
};

export const deletePost = async (
    request: FastifyRequest<GetPostRequest>,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        await PostService.deletePost(request.params.id, authorId);

        reply.status(200).send({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        throw error;
    }
};

export const likePost = async (
    request: FastifyRequest<LikePostRequest>,
    reply: FastifyReply
) => {
    try {
        const userId = request.user._id.toString();
        const post = await PostService.likePost(request.params.id, userId);

        reply.send({
            success: true,
            message: "Post liked successfully",
            data: { post }
        });
        } catch (error) {
            throw error;
        }
    };

export const getUserPosts = async ( 
    request: FastifyRequest<GetPostsRequest>,
    reply: FastifyReply
) => {
    try {
        const author = request.user._id.toString();
        const post = await PostService.getPostsByAuthor(author, request.query);

        reply.send({
            success: true,
            message: "Post unliked successfully",
            data: { post }
        });
    } catch (error) {
        throw error;
    }
};


