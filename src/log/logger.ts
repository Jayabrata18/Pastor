import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import * as util from 'util';
import {
    ConsoleTransportInstance,
    FileTransportInstance,
} from 'winston/lib/winston/transports';
import * as path from 'path';
import * as sourceMapSupport from 'source-map-support';
import { blue, red, yellow, green, magenta, cyan } from 'colorette';
import * as moment from 'moment-timezone';

sourceMapSupport.install();

// Environment enum
export enum EApplicationEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

const colorizeLvel = (level: string) => {
    switch (level) {
        case 'INFO':
            return blue(level);
        case 'WARN':
            return yellow(level);
        case 'ERROR':
            return red(level);
        case 'DEBUG':
            return magenta(level);
        case 'VERBOSE':
            return cyan(level);
        default:
            return level;
    }
};

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, context, trace, meta = {} } = info;
    const customLevel = colorizeLvel(level.toUpperCase());
    const customTimestamp = green(
        moment.tz(timestamp as string, 'Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'),
    );
    const customContext = context ? cyan(`[${context}]`) : '';
    const customMessage = message;

    // Handle meta data
    const customMeta = Object.keys(meta as object).length > 0
        ? util.inspect(meta, {
            depth: null,
            colors: true,
            compact: true,
            showHidden: false,
        })
        : '';

    // Handle stack trace
    const customTrace = trace ? `\n${red('TRACE')}: ${trace}` : '';

    const customLog = `${customLevel} ${customContext} [${customTimestamp}] ${customMessage}${customMeta ? `\n${magenta('META')}: ${customMeta}` : ''
        }${customTrace}\n`;

    return customLog;
});

const consoleTransport = (): Array<ConsoleTransportInstance> => {
    const currentEnv = process.env.NODE_ENV || EApplicationEnvironment.DEVELOPMENT;

    if (currentEnv === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'debug',
                format: format.combine(
                    format.timestamp(),
                    format.errors({ stack: true }),
                    consoleLogFormat
                ),
                handleExceptions: true,
                handleRejections: true,
            }),
        ];
    }

    // Production console transport (minimal)
    return [
        new transports.Console({
            level: 'warn',
            format: format.combine(
                format.timestamp(),
                format.simple()
            ),
            handleExceptions: true,
            handleRejections: true,
        }),
    ];
};

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, context, trace, meta = {} } = info;
    const logMeta: Record<string, unknown> = {};

    // Process meta data and handle errors properly
    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack,
                trace: value.stack || '',
            };
        } else {
            logMeta[key] = value;
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        context: context || 'Application',
        timestamp: moment.tz(timestamp as string, 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        meta: Object.keys(logMeta).length > 0 ? logMeta : undefined,
        trace: trace || undefined,
    };

    return JSON.stringify(logData, null, 2);
});

const fileTransport = (): Array<FileTransportInstance> => {
    const currentEnv = process.env.NODE_ENV || EApplicationEnvironment.DEVELOPMENT;
    const logsDir = path.join(process.cwd(), 'logs');

    return [
        // Combined logs
        new transports.File({
            filename: path.join(logsDir, `${currentEnv}.log`),
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                fileLogFormat
            ),
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Error logs
        new transports.File({
            filename: path.join(logsDir, `${currentEnv}-error.log`),
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                fileLogFormat
            ),
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ];
};

// Create the logger instance
const privateLogger = createLogger({
    level: process.env.NODE_ENV === EApplicationEnvironment.PRODUCTION ? 'info' : 'debug',
    defaultMeta: {
        service: 'job-listing-api',
        application: 'NestJS Backend',
    },
    transports: [
        ...fileTransport(),
        ...consoleTransport(),
    ],
    exitOnError: false,
});

// Export for NestJS Winston integration
export const loggerConfig = WinstonModule.createLogger({
    instance: privateLogger,
});

export default privateLogger;