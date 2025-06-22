import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DatabaseExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let details: any = null;

        // Log the exception
        this.logger.error(
            `Database Exception: ${exception.message}`,
            exception.stack,
            {
                url: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
            },
        );

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'object') {
                message = (response as any).message || message;
                error = (response as any).error || error;
                details = (response as any).details;
            }
        } else if (exception instanceof MongoError) {
            // Handle MongoDB specific errors
            switch (exception.code) {
                case 11000: // Duplicate key error
                    status = HttpStatus.CONFLICT;
                    error = 'Duplicate Key Error';
                    message = this.extractDuplicateKeyMessage(exception);
                    break;
                case 11001: // Duplicate key on update
                    status = HttpStatus.CONFLICT;
                    error = 'Duplicate Key Error';
                    message = 'Duplicate key error on update operation';
                    break;
                default:
                    status = HttpStatus.BAD_REQUEST;
                    error = 'Database Error';
                    message = exception.message;
            }
        } else if (exception instanceof MongooseError.ValidationError) {
            status = HttpStatus.BAD_REQUEST;
            error = 'Validation Error';
            message = 'Document validation failed';
            details = this.extractValidationErrors(exception);
        } else if (exception instanceof MongooseError.CastError) {
            status = HttpStatus.BAD_REQUEST;
            error = 'Cast Error';
            message = `Invalid ${exception.path}: ${exception.value}`;
        } else if (exception.name === 'MongoNetworkError') {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            error = 'Database Connection Error';
            message = 'Unable to connect to database';
        } else if (exception.name === 'MongoTimeoutError') {
            status = HttpStatus.REQUEST_TIMEOUT;
            error = 'Database Timeout';
            message = 'Database operation timed out';
        }

        const errorResponse = {
            statusCode: status,
            error,
            message,
            ...(details && { details }),
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        response.status(status).json(errorResponse);
    }

    private extractDuplicateKeyMessage(error: MongoError): string {
        const match = error.message.match(/index: (.+) dup key: { (.+) }/);
        if (match) {
            const field = match[2].split(':')[0].trim();
            return `Duplicate value for field: ${field}`;
        }
        return 'Duplicate key error';
    }

    private extractValidationErrors(error: MongooseError.ValidationError): any {
        const errors = {};
        for (const key in error.errors) {
            errors[key] = error.errors[key].message;
        }
        return errors;
    }
  }