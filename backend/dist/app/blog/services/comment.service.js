"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_model_1 = require("../database/models/comment.model");
const post_model_1 = require("../database/models/post.model");
const errorHandler_1 = require("../../../middleware/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
class CommentService {
    // Create a new comment
    static async createComment(authorId, commentData) {
        try {
            const post = await post_model_1.Post.findById(commentData.postId);
            if (!post) {
                throw (0, errorHandler_1.createError)('Post not found', 404);
            }
            if (commentData.parentComment) {
                const parentComment = await comment_model_1.Comment.findById(commentData.parentComment);
                if (!parentComment) {
                    throw (0, errorHandler_1.createError)('Parent comment not found', 404);
                }
                if (parentComment.post.toString() !== commentData.postId) {
                    throw (0, errorHandler_1.createError)('Parent comment does not belong to the specified post', 400);
                }
            }
            const comment = new comment_model_1.Comment({
                ...commentData,
                author: authorId,
            });
            await comment.save();
            await post_model_1.Post.findByIdAndUpdate(commentData.postId, {
                $push: { comment: comment._id }
            });
            if (commentData.parentComment) {
                await comment_model_1.Comment.findByIdAndUpdate(commentData.parentComment, {
                    $push: { replies: comment._id }
                });
            }
            const populatedComment = await comment_model_1.Comment.findById(comment._id)
                .populate("author", "username avatar")
                .populate("post", "title")
                .populate("parentComment", "content");
            return populatedComment;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error creating comment', 400);
        }
    }
    // Get comments for a specific post
    static async getPostComments(postId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                throw (0, errorHandler_1.createError)('Invalid Post ID', 400);
            }
            const post = await post_model_1.Post.findById(postId);
            if (!post) {
                throw (0, errorHandler_1.createError)('Post not found', 404);
            }
            const comments = await comment_model_1.Comment.find({
                post: postId,
                parentComment: null
            }).populate('author', 'username avatar')
                .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            })
                .sort({ createdAt: -1 });
            return comments;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error retrieving comments', 400);
        }
    }
    // Get a single comment by ID
    static async getCommentById(commentId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(commentId)) {
                throw (0, errorHandler_1.createError)('Invalid Comment ID', 400);
            }
            const comment = await comment_model_1.Comment.findById(commentId)
                .populate('author', 'username avatar')
                .populate('post', 'title')
                .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            });
            if (!comment) {
                throw (0, errorHandler_1.createError)('Comment not found', 404);
            }
            return comment;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error retrieving comment', 400);
        }
    }
    // Update a comment
    static async updateComment(commentId, authorId, updateData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(commentId)) {
                throw (0, errorHandler_1.createError)('Invalid Comment ID', 400);
            }
            const comment = await comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw (0, errorHandler_1.createError)('Comment not found', 404);
            }
            if (comment.author.toString() !== authorId) {
                throw (0, errorHandler_1.createError)('Unauthorized to update this comment', 403);
            }
            const updatedComment = await comment_model_1.Comment.findByIdAndUpdate(commentId, {
                content: updateData.content,
                isEdited: true
            }, {
                new: true,
                runValidators: true
            }).populate('author', 'username avatar');
            if (!updatedComment) {
                throw (0, errorHandler_1.createError)('Error updating comment', 400);
            }
            return updatedComment;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error updating comment', 400);
        }
    }
    // Like a comment
    static async likeComment(commentId, userId) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(commentId)) {
                throw (0, errorHandler_1.createError)('Invalid Comment ID', 400);
            }
            const comment = await comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw (0, errorHandler_1.createError)('Comment not found', 404);
            }
            const isLiked = comment.likes.includes(new mongoose_1.default.Types.ObjectId(userId));
            if (isLiked) {
                comment.likes = comment.likes.filter(id => id.toString() !== userId);
            }
            else {
                comment.likes.push(new mongoose_1.default.Types.ObjectId(userId));
            }
            await comment.save();
            const populatedComment = await comment_model_1.Comment.findById(commentId)
                .populate('author', 'username avatar')
                .populate('post', 'title');
            return populatedComment;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error liking comment', 400);
        }
    }
    // Delete a comment
    static async deleteComment(commentId, authorId) {
        try {
            if (mongoose_1.default.Types.ObjectId.isValid(commentId)) {
                throw (0, errorHandler_1.createError)('Invalid Comment ID', 400);
            }
            const comment = await comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw (0, errorHandler_1.createError)('Comment not found', 404);
            }
            if (comment.author.toString() !== authorId) {
                throw (0, errorHandler_1.createError)('Unauthorized to delete this comment', 403);
            }
            await post_model_1.Post.findByIdAndUpdate(comment.post, {
                $pull: { comments: commentId }
            });
            if (comment.parentComment) {
                await comment_model_1.Comment.findByIdAndUpdate(comment.parentComment, {
                    $pull: { replies: commentId }
                });
            }
            const repliesToDelete = await comment_model_1.Comment.find({ parentComment: commentId });
            for (const reply of repliesToDelete) {
                await post_model_1.Post.findByIdAndUpdate(reply.post, {
                    $pull: { comments: reply._id }
                });
            }
            await comment_model_1.Comment.deleteMany({ parentComment: commentId });
            await comment_model_1.Comment.findByIdAndDelete(commentId);
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Error deleting comment', 400);
        }
    }
}
exports.CommentService = CommentService;
