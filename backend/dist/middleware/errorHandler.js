"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, reply) => {
    const { statusCode = 500, message } = error;
    console.error("Error: ", error);
    return reply.status(statusCode).send({
        success: false,
        status: 'error',
        error: {
            message: statusCode === 500 ? 'Internal Server Error' : message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
