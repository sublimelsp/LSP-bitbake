export interface OutputChannel {
    appendLine: (message: string) => void;
    show: () => void;
    clear: () => void;
    dispose: () => void;
}
export declare class OutputLogger {
    private static instance;
    level: string;
    outputChannel: OutputChannel | undefined;
    private constructor();
    static getInstance(): OutputLogger;
    log(message: string, level?: string): void;
    info(message: string): void;
    debug(message: string): void;
    debug_ratelimit(message: string): void;
    private static readonly rateLimitPatterns;
    private static readonly rateLimit;
    private rateLimitStart;
    private rateLimitCount;
    warn(message: string): void;
    error(message: string): void;
    clear(): void;
    private shouldLog;
}
export declare const logger: OutputLogger;
