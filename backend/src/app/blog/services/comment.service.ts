import { Comment, IComment } from '../database/models/comment.model';
import { Post } from '../database/models/post.model';
import { createError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface CreateCommentData {
    content: string;
    postId: string;
    parentComment?: string;
}

export interface UpdateCommentData {
    content?: string;
}

export class CommentService {

    // Create a new comment
    public static async createComment( authorId: string, commentData: CreateCommentData ): Promise<IComment> {
        try {
            const post = await Post.findById(commentData.postId);
            if (!post) {
                throw createError('Post not found', 404);
            }

            if (commentData.parentComment) {
                const parentComment = await Comment.findById(commentData.parentComment);
                if (!parentComment) {
                    throw createError('Parent comment not found', 404);
                }
            
                if (parentComment.post.toString() !== commentData.postId) {
                    throw createError('Parent comment does not belong to the specified post', 400);
                }

            }
            const comment = new Comment({
                ...commentData,
                author: authorId,
            });

            await comment.save();

            await Post.findByIdAndUpdate(commentData.postId, {
                $push: { comment: comment._id }
            });

            if (commentData.parentComment) {
                await Comment.findByIdAndUpdate(commentData.parentComment, {
                    $push: { replies: comment._id }
                });
            }

            const populatedComment = await Comment.findById(comment._id)
                .populate("author", "username avatar")
                .populate("post", "title")
                .populate("parentComment", "content");

            return populatedComment!;

        } catch (error: any) {
            throw createError('Error creating comment', 400);
        }
    }
    // Get comments for a specific post
    public static async getPostComments( postId: string): Promise<IComment[]> {
        try {            
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw createError('Invalid Post ID', 400);
            }

            const post = await Post.findById(postId);
            if (!post) {
                throw createError('Post not found', 404);
            }

            const comments = await Comment.find({
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

        } catch (error: any) {
            throw createError('Error retrieving comments', 400);
        }
    }

    // Get a single comment by ID
    public static async getCommentById( commentId: string ): Promise<IComment> {
        try {
            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                throw createError('Invalid Comment ID', 400);
            }

            const comment = await Comment.findById(commentId)
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
                throw createError('Comment not found', 404);
            }
            return comment;
        } catch (error: any) {
            throw createError('Error retrieving comment', 400);
        }
    }
    // Update a comment
    public static async updateComment( commentId: string, authorId: string, updateData: UpdateCommentData ): Promise<IComment> {
        try {
            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                throw createError('Invalid Comment ID', 400);
            }
            const comment = await Comment.findById(commentId);
            if (!comment) {
                throw createError('Comment not found', 404);
            }

            if (comment.author.toString() !== authorId) {
                throw createError('Unauthorized to update this comment', 403);
            }

            const updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                {
                    content: updateData.content,
                    isEdited: true
                },
                {
                    new: true,
                    runValidators: true }
                ).populate('author', 'username avatar');

                if (!updatedComment) {
                    throw createError('Error updating comment', 400);
                }
                return updatedComment;

        } catch (error: any) {
            throw createError('Error updating comment', 400);
        }
    }

    // Like a comment
    public static async likeComment( commentId: string, userId: string ): Promise<IComment> {
        try {
            if (!mongoose.Types.ObjectId.isValid(commentId)) {
                throw createError('Invalid Comment ID', 400);
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                throw createError('Comment not found', 404);
            }

            const isLiked = comment.likes.includes(new mongoose.Types.ObjectId(userId));
            if (isLiked) {
                comment.likes = comment.likes.filter(id => id.toString() !== userId);
            } else {
                comment.likes.push(new mongoose.Types.ObjectId(userId));
            }
            
            await comment.save();
            
            const populatedComment = await Comment.findById(commentId)
            .populate('author', 'username avatar')
            .populate('post', 'title');

            return populatedComment!;

        } catch (error: any) {
            throw createError('Error liking comment', 400);
        }
    }

    // Delete a comment
    public static async deleteComment( commentId: string, authorId: string ): Promise<void> {
        try {
            if (mongoose.Types.ObjectId.isValid(commentId)) {
                throw createError('Invalid Comment ID', 400);
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                throw createError('Comment not found', 404);
            }

            if (comment.author.toString() !== authorId ) {
                throw createError('Unauthorized to delete this comment', 403);
            }

            await Post.findByIdAndUpdate(comment.post, {
                $pull: { comments: commentId }
        });

        if (comment.parentComment) {
            await Comment.findByIdAndUpdate (comment.parentComment, {
                $pull: { replies: commentId }
            });
        }


        const repliesToDelete = await Comment.find({ parentComment: commentId });
        for (const reply of repliesToDelete) {
            await Post.findByIdAndUpdate( reply.post, {
                $pull: { comments: reply._id}
            });
        }
        await Comment.deleteMany({ parentComment: commentId });

        await Comment.findByIdAndDelete(commentId);

        } catch (error: any) {
            throw createError('Error deleting comment', 400);
        }
    }

}    

