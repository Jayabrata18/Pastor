import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import privateLogger from 'src/log/logger';

@Injectable()
export class DatabaseLoggingInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers, body, query, params, ip } = request;
        const startTime = Date.now();
        const requestId = this.generateRequestId();

        // Extract user information if available
        const userId = request.user?.id || 'anonymous';
        const userAgent = headers['user-agent'] || 'unknown';

        // Get controller and handler information
        const controllerName = context.getClass().name;
        const handlerName = context.getHandler().name;

        const metadata = {
            requestId,
            timestamp: new Date().toISOString(),
            method,
            url,
            controllerName,
            handlerName,
            userId,
            userAgent,
            clientIp: ip,
            queryParams: query,
            routeParams: params,
            bodySize: body ? JSON.stringify(body).length : 0,
        };

        privateLogger.info(
            `Database operation started: ${method} ${url}`, { context: 'DatabaseLoggingInterceptor' },
            {
                ...metadata,
                phase: 'start',
            }
        );

        return next.handle().pipe(
            tap((response) => {
                const duration = Date.now() - startTime;
                const responseSize = response ? JSON.stringify(response).length : 0;

                privateLogger.info(
                    `Database operation completed: ${method} ${url} - ${duration}ms`, { context: 'DatabaseLoggingInterceptor' },
                  {
                        ...metadata,
                        phase: 'success',
                        duration,
                        responseSize,
                        status: 'success',
                    }
                );
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;

                privateLogger.error(
                    `Database operation failed: ${method} ${url} - ${duration}ms`, { context: 'DatabaseLoggingInterceptor' },
                    {
                        ...metadata,
                        phase: 'error',
                        duration,
                        status: 'failed',
                        errorName: error.name,
                        errorMessage: error.message,
                        errorCode: error.code,
                        stack: error.stack,
                    }
                );
                throw error;
            }),
        );
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}