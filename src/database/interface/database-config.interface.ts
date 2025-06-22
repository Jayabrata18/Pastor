export interface DatabaseConfig {
    uri: string;
    options: {
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
        maxPoolSize: number;
        serverSelectionTimeoutMS: number;
        socketTimeoutMS: number;
        bufferMaxEntries: number;
        bufferCommands: boolean;
        retryWrites: boolean;
        retryReads: boolean;
    };
    retryAttempts: number;
    retryDelay: number;
}

export interface DatabaseHealthStatus {
    status: string;
    info?: Record<string, any>;
    error?: Record<string, any>;
    details?: Record<string, any>;
  }