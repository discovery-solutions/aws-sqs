import { EventEmitter } from "events";
interface Credentials {
    accessKeyId: string;
    secretAccessKey: string;
}
interface SQSOptions {
    logger?: any;
    region?: string;
    credentials?: Credentials;
    maxMessages?: number;
    pollingInterval?: number;
}
export declare class SQS extends EventEmitter {
    private logger;
    private queueUrl;
    private client;
    private pollingInterval;
    private isPolling;
    private maxMessages;
    constructor(queueUrl: string, { logger, credentials, region, maxMessages, pollingInterval }: SQSOptions);
    setCredentials({ region, credentials }: {
        credentials: Credentials;
        region: string;
    }): void;
    start(): void;
    stop(): void;
    send(data: Record<string, any>): Promise<void>;
    delete(receiptHandle: string): Promise<void>;
    private pollMessages;
}
export {};
