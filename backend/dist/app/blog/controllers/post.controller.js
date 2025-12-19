"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosts = exports.likePost = exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllPosts = exports.createPost = void 0;
const post_service_1 = require("../services/post.service");
const createPost = async (request, reply) => {
    try {
        const authorId = request.user._id.toString();
        const post = await post_service_1.PostService.createPost(authorId, request.body);
        reply.status(201).send({
            success: true,
            data: post
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createPost = createPost;
const getAllPosts = async (request, reply) => {
    try {
        const postsData = await post_service_1.PostService.getAllPosts({
            ...request.query,
            published: true
        });
        reply.status(200).send({
            success: true,
            data: postsData,
            message: "Posts retrieved successfully"
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAllPosts = getAllPosts;
const getPostById = async (request, reply) => {
    try {
        const { id } = request.params;
        const post = await post_service_1.PostService.getPostById(id);
        reply.status(200).send({
            success: true,
            data: post,
            message: "Post retrieved successfully"
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getPostById = getPostById;
const updatePost = async (request, reply) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params;
        const post = await post_service_1.PostService.updatePost(id, authorId, request.body);
        reply.status(200).send({
            success: true,
            data: post,
            message: "Post updated successfully"
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updatePost = updatePost;
const deletePost = async (request, reply) => {
    try {
        const authorId = request.user._id.toString();
        const { id } = request.params;
        await post_service_1.PostService.deletePost(id, authorId);
        reply.status(200).send({
            success: true,
            message: "Post deleted successfully"
        });
    }
    catch (error) {
        throw error;
    }
};
exports.deletePost = deletePost;
const likePost = async (request, reply) => {
    try {
        const userId = request.user._id.toString();
        const { id } = request.params;
        const post = await post_service_1.PostService.likePost(id, userId);
        reply.send({
            success: true,
            message: "Post liked successfully",
            data: { post }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.likePost = likePost;
const getUserPosts = async (request, reply) => {
    try {
        const author = request.user._id.toString();
        const post = await post_service_1.PostService.getPostsByAuthor(author, request.query);
        reply.send({
            success: true,
            message: "Post unliked successfully",
            data: { post }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getUserPosts = getUserPosts;
