import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import privateLogger, { createContextualLogger } from './log/logger';
import config from './config/config'; 

async function bootstrap() {
  const privateLogger = createContextualLogger('Bootstrap');
  privateLogger.info('---------Backend is starting---------');

  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable default logger initially
    abortOnError: false,
    bufferLogs: true,
    rawBody: true,
  });

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security middleware - helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: config.ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression middleware
  // app.use(compression());

  // Trust proxy for production deployments (load balancers, reverse proxies)
  // if (config.ENV === 'production') {
  //   const expressApp = app.getHttpAdapter().getInstance();
  //   expressApp.set('trust proxy', 1);
  // }

  app.setGlobalPrefix('api');

  // Global validation pipe with enhanced options
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: config.ENV === 'production',
    validationError: {
      target: true,
      value: false,
    },
  }));

  // Enhanced CORS configuration
  const corsOrigins = config.CORS_ORIGIN
    ? config.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : config.ENV === 'production'
      ? [] // No wildcard in production
      : [config.CORS_ORIGIN]; // Common dev ports

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // app.enableVersioning({
  //   type: VersioningType.HEADER,
  //   header: 'Accept-Version',
  //   defaultVersion: '1',
  // });  



  // Swagger documentation (only in non-production environments)
  if (config.ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pastor API')
      .setDescription('The Pastor API for managing videos, audios, podcasts, and more.')
      .setVersion('1.0')
      // .addTag('users', 'User management endpoints')
      // .addTag('jobs', 'Job listing endpoints')
      // .addTag('analytics', 'Analytics and reporting endpoints')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      })
      .addServer(`http://localhost:${config.PORT}`, 'Local development')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
      },
    });
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.ENV,
      version: config.npm_package_version,
    });
    privateLogger.info('Health check endpoint hit', {
      meta: { status: 'ok' }
    });
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    privateLogger.info(`Received ${signal}. Starting graceful shutdown...`, {
      meta: { signal }
    });

    app.close().then(() => {
      privateLogger.info('Application closed successfully', {
      });
      process.exit(0);
    }).catch((error) => {
      privateLogger.error('Error during graceful shutdown', {
        meta: { error: error.message },
        trace: error.stack
      });
      process.exit(1);
    });
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    privateLogger.error('Uncaught Exception', {
      meta: { error: error.message },
      trace: error.stack
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    privateLogger.error('Unhandled Rejection', {
      meta: { reason, promise }
    });
    process.exit(1);
  });

  const port = config.PORT; 
  const host = config.HOST;

  await app.listen(port, host);

  // Database connection logging
  privateLogger.info('Database connection established successfully', {
    meta: { uri: config.DATABASE_URL }
  });
  privateLogger.info(`🚀 Application is running on: http://${host}:${port}`, {
    meta: {
      port,
      host,
      environment: config.ENV,
      cors: corsOrigins,
      version: config.npm_package_version
    }
  });

  if (config.ENV !== 'production') {
    privateLogger.info(`📚 Swagger documentation available at: http://${host}:${port}/api/docs`);
  }

  privateLogger.info(`💚 Health check available at: http://${host}:${port}/health`,  );
}

bootstrap().catch((error) => {
  privateLogger.error('Failed to start application', {
    meta: { error: error.message },
    trace: error.stack
  });
  process.exit(1);
});