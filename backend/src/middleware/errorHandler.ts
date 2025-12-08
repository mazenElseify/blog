// import  { Request, Response, NextFunction } from 'express';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    error: AppError,
    req: FastifyRequest,
    reply: FastifyReply,
) => {
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

export const createError = (message: string, statusCode: number = 500) : AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}
