import type { FastifyRequest, FastifyReply } from 'fastify';
import { PostService, CreatePostData, UpdatePostData, PostQuery } from '../services/post.service';



export const createPost = async (
    request: FastifyRequest,
    reply: FastifyReply 
) => {
    try {
        const authorId = request.user._id.toString();

        const post = await PostService.createPost(authorId, request.body as CreatePostData);


        reply.status(201).send({
            success: true,
            data: post
        });
    } catch (error) {
        throw error;
    }
};

export const getAllPosts = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const postsData = await PostService.getAllPosts({
            ...(request.query as PostQuery),
            published: true
        });
        
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
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params as { id: string };
        const post = await PostService.getPostById(id);

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
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params as { id: string };
        const post = await PostService.updatePost(id , authorId, request.body as UpdatePostData);

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
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params as { id: string };
        await PostService.deletePost(id, authorId);

        reply.status(200).send({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        throw error;
    }
};

export const likePost = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user._id.toString();
        const { id } = request.params as { id: string };
        const post = await PostService.likePost(id, userId);

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
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const author = request.user._id.toString();
        const post = await PostService.getPostsByAuthor(author, request.query as PostQuery);

        reply.send({
            success: true,
            message: "Post unliked successfully",
            data: { post }
        });
    } catch (error) {
        throw error;
    }
};


