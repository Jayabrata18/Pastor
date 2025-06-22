import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseConnectionException extends HttpException {
    constructor(message?: string) {
        super(
            {
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                error: 'Database Connection Error',
                message: message || 'Unable to connect to database',
                timestamp: new Date().toISOString(),
            },
            HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
}

export class DocumentNotFoundException extends HttpException {
    constructor(model: string, id: string) {
        super(
            {
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Document Not Found',
                message: `${model} with ID ${id} not found`,
                timestamp: new Date().toISOString(),
            },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class DocumentValidationException extends HttpException {
    constructor(errors: any) {
        super(
            {
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Document Validation Error',
                message: 'Document validation failed',
                details: errors,
                timestamp: new Date().toISOString(),
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class DuplicateKeyException extends HttpException {
    constructor(field: string, value: any) {
        super(
            {
                statusCode: HttpStatus.CONFLICT,
                error: 'Duplicate Key Error',
                message: `Duplicate value for field: ${field}`,
                field,
                value,
                timestamp: new Date().toISOString(),
            },
            HttpStatus.CONFLICT,
        );
    }
}

export class DatabaseTimeoutException extends HttpException {
    constructor(operation: string) {
        super(
            {
                statusCode: HttpStatus.REQUEST_TIMEOUT,
                error: 'Database Timeout',
                message: `Database operation '${operation}' timed out`,
                timestamp: new Date().toISOString(),
            },
            HttpStatus.REQUEST_TIMEOUT,
        );
    }
}