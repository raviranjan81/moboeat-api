import dotenv from "dotenv";
dotenv.config();
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'local') {
        return res.status(statusCode).json({
            response: false,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }

    if (err.isOperational) {
        return res.status(statusCode).json({
            response: false,
            message: err.message,
        });
    } else {
        console.error(err);
        return res.status(500).json({
            response: false,
            message: 'Something went wrong on the server',
        });
    }
};
