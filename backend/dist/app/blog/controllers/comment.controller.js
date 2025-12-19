"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = void 0;
const comment_service_1 = require("../services/comment.service");
const createComment = async (request, reply) => {
    try {
        const authorId = request.user._id.toString();
        const comment = await comment_service_1.CommentService.createComment(authorId, request.body);
        reply.status(201).send({
            success: true,
            data: comment
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createComment = createComment;
