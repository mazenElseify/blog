import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    post: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;
    replies: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        maxlength: [1000, "Content must be at most 1000 characters long"]
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "post",
        required: [true, "Post is required"]
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"]
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete (ret as any).__v;
            return ret;
        }
    }
});

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1});
commentSchema.index({ createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
