import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    post?: mongoose.Types.ObjectId;
    comment?: mongoose.Types.ObjectId;
    likeType: 'post' | 'comment';
    createdAt: Date;
}

const likeSchema = new Schema<ILike>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    likeType: {
        type: String,
        enum: ['post', 'comment'],
        required: [ true, "Like type is required" ]
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
        transform: function (doc, ret) {
            delete  ( ret as any ).__v;
            return ret;
        }
    }
});


likeSchema.pre('validate', function (next) {
    if (this.likeType === 'post' && !this.post) {
        return next(new Error("Post ID is required for post likes"));
    }
    if (this.likeType === 'comment' && !this.comment) {
        return next(new Error("Comment ID is required for comment likes"));
    }
    if (this.post && this.comment) {
        return next(new Error("Like can be associated with either a post or a comment, not both"));
    }
    next();
});

likeSchema.index ({ user: 1, post: 1 }, {
    unique: true,
    sparse: true,
    name: "user_post-like-unique"
});

likeSchema.index({ user: 1, comment: 1 }, {
    unique: true,
    sparse: true,
    name: "user_comment-like-unique"
});

likeSchema.index({ post: 1, createdAt: -1});
likeSchema.index({ comment: 1, createdAt: -1});
likeSchema.index({ user: 1, createdAt: -1});
likeSchema.index({ likeType: 1});

export const Like = mongoose.model<ILike>("Like", likeSchema);
