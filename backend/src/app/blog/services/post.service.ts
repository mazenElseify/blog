import { Post, IPost } from '../database/models/post.model';
import { createError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface CreatePostData {
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    category: string;
    authorId: string;
    published?: boolean;
    coverImage?: string;
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    summary?: string;
    tags?: string[];
    category?: string;
    published?: boolean;
    coverImage?: string;
}

export interface PostQuery {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    published?: boolean;
    tags?: string[];
    search?: string;
}

export class PostService {

    public static async createPost( authorId: string, postData: CreatePostData ): Promise<IPost> {
        try{
            const post = new Post({
                ...postData,
                author: authorId,
                published: postData.published || false,
            });

            return await post.save();
        } catch (error: any) {
            throw createError('Error creating post', 400);
        }
    }

    public static async getAllPosts(query: PostQuery = {}): Promise<{

        posts: IPost[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalPosts: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }> {
        const {
            page = 1,
            limit = 10,
            category,
            author,
            published,
            tags,
            search
        } = query;
        
        const filter: any ={};

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
            filter.tags = { $in: tags};
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i')},
                { content: new RegExp(search, 'i')},
                { summary: new RegExp(search, 'i')}
            ];
        }

        const skip = (page - 1) * limit;
        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find(filter)
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

    public static async getPostById(postId: string): Promise<IPost> {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw createError('Invalid Post ID', 400);
        }

        const post = await Post.findById(postId)
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
            throw createError('Post not found', 404);
        }

        await Post.findByIdAndUpdate(postId, { $inc: {viewCount: 1 } });
        
        return post;
    }

    public static async updatePost(postId: string, authorId: string, updateData: UpdatePostData): Promise<IPost> {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw createError('Invalid Post ID', 400);
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            throw createError('Post not found', 404);
        }

        if (post.author.toString() !== authorId) {
            throw createError('You can only update your own posts', 403);
        }

        if (updateData.published && !post.published) {
            (updateData as any).publishedAt = new Date();
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { ...updateData },
            {
                new: true,
                runvalidators: true
            }
        ).populate('author', 'username avatar');

        if (!updatedPost) {
            throw createError('Error updating post', 400);
        }

        return updatedPost;
    }

    public static async deletePost(postId: string, authorId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw createError('Invalid Post ID', 400);
        }

        const post = await Post.findById(postId);
        if (!post) {
            throw createError('Post not found', 404);
        }

        if (post.author.toString() !== authorId) {
            throw createError('You can only delete your own posts', 403);
        }

        await Post.findByIdAndDelete(postId);
    }

    public static async likePost(postId: string, userId: string): Promise<IPost> {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw createError('Invalid Post ID', 400);
        }

        const post = await Post.findById(postId);
        if (!post) {
            throw createError('Post not found', 404);
        }

        const isLiked = (post.likes.includes(new mongoose.Types.ObjectId(userId)));

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(new mongoose.Types.ObjectId(userId));
        }

        await post.save();

        return post;
    }

    public static async getPostsByAuthor(authorId: string, query: PostQuery = {}): Promise<{
        posts: IPost[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalPosts: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }> {
        return this.getAllPosts({ ...query, author: authorId });
    }

}





