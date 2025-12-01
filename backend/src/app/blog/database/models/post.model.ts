import mongoose, {Document, Schema } from 'mongoose';

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    summary?: string;
    author: mongoose.Types.ObjectId;
    category: string;
    tags: string[];
    coverImage?: string;
    published: boolean;
    publishedAt?: Date;
    viewCount: number;
    likes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [150, "Title must be at most 150 characters long"],
    },
    content: {
        type: String,
        required: [true, "Content is reqquired"],
    },
    summary: {
        type: String,
        trim: true,
        maxlength: [300, "Summary must be at most 300 characters long"],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"]
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    coverImage: {
        type: String,
        default: null
    },
    published: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete (ret as any).__v;
            return ret;
        }
    }
});

postSchema.index({ title: "text", content: "text", summary: "text" });
postSchema.index({ author: 1});
postSchema.index({ category: 1});
postSchema.index({ tags: 1});
postSchema.index({ published: 1});
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost> ( 'post', postSchema);