"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const likeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    likeType: {
        type: String,
        enum: ['post', 'comment'],
        required: [true, "Like type is required"]
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
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
likeSchema.index({ user: 1, post: 1 }, {
    unique: true,
    sparse: true,
    name: "user_post-like-unique"
});
likeSchema.index({ user: 1, comment: 1 }, {
    unique: true,
    sparse: true,
    name: "user_comment-like-unique"
});
likeSchema.index({ post: 1, createdAt: -1 });
likeSchema.index({ comment: 1, createdAt: -1 });
likeSchema.index({ user: 1, createdAt: -1 });
likeSchema.index({ likeType: 1 });
exports.Like = mongoose_1.default.model("Like", likeSchema);
