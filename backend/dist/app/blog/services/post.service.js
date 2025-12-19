"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const post_model_1 = require("../database/models/post.model");
const errorHandler_1 = require("../../../middleware/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
class PostService {
    static async createPost(authorId, postData) {
        try {
            const post = new post_model_1.Post({
                ...postData,
                author: authorId,
                published: postData.published || false,
            });
            return await post.save();
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error creating post', 400);
        }
    }
    static async getAllPosts(query = {}) {
        const { page = 1, limit = 10, category, author, published, tags, search } = query;
        const filter = {};
        if (published !== undefined) {
            filter.published = published;
        }
        if (category) {
            filter.category = new RegExp(category, 'i');
        }
        if (author) {
            filter.author = author;
        }
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') },
                { summary: new RegExp(search, 'i') }
            ];
        }
        const skip = (page - 1) * limit;
        const totalPosts = await post_model_1.Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = await post_model_1.Post.find(filter)
            .populate('author', 'username avatar')
            .populate('likes', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return {
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }
    static async getPostById(postId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            throw (0, errorHandler_1.createError)('Invalid Post ID', 400);
        }
        const post = await post_model_1.Post.findById(postId)
            .populate('author', 'username avatar bio')
            .populate('likes', 'username')
            .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'username avatar'
            }
        });
        if (!post) {
            throw (0, errorHandler_1.createError)('Post not found', 404);
        }
        await post_model_1.Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
        return post;
    }
    static async updatePost(postId, authorId, updateData) {
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            throw (0, errorHandler_1.createError)('Invalid Post ID', 400);
        }
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            throw (0, errorHandler_1.createError)('Post not found', 404);
        }
        if (post.author.toString() !== authorId) {
            throw (0, errorHandler_1.createError)('You can only update your own posts', 403);
        }
        if (updateData.published && !post.published) {
            updateData.publishedAt = new Date();
        }
        const updatedPost = await post_model_1.Post.findByIdAndUpdate(postId, { ...updateData }, {
            new: true,
            runvalidators: true
        }).populate('author', 'username avatar');
        if (!updatedPost) {
            throw (0, errorHandler_1.createError)('Error updating post', 400);
        }
        return updatedPost;
    }
    static async deletePost(postId, authorId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            throw (0, errorHandler_1.createError)('Invalid Post ID', 400);
        }
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            throw (0, errorHandler_1.createError)('Post not found', 404);
        }
        if (post.author.toString() !== authorId) {
            throw (0, errorHandler_1.createError)('You can only delete your own posts', 403);
        }
        await post_model_1.Post.findByIdAndDelete(postId);
    }
    static async likePost(postId, userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            throw (0, errorHandler_1.createError)('Invalid Post ID', 400);
        }
        const post = await post_model_1.Post.findById(postId);
        if (!post) {
            throw (0, errorHandler_1.createError)('Post not found', 404);
        }
        const isLiked = (post.likes.includes(new mongoose_1.default.Types.ObjectId(userId)));
        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        }
        else {
            post.likes.push(new mongoose_1.default.Types.ObjectId(userId));
        }
        await post.save();
        return post;
    }
    static async getPostsByAuthor(authorId, query = {}) {
        return this.getAllPosts({ ...query, author: authorId });
    }
}
exports.PostService = PostService;
exports.postService = new PostService;
