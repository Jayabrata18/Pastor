import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class DatabaseLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(DatabaseLoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const startTime = Date.now();

        this.logger.log(`Database operation started: ${method} ${url}`);

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startTime;
                this.logger.log(
                    `Database operation completed: ${method} ${url} - ${duration}ms`,
                );
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                this.logger.error(
                    `Database operation failed: ${method} ${url} - ${duration}ms`,
                    error.stack,
                );
                throw error;
            }),
        );
    }
  }