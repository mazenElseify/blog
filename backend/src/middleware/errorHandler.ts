import  { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { statusCode = 500, message } = error;

    console.error("Error: ", error);

    res.status(statusCode).json({
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
