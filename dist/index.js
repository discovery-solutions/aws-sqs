"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQS = void 0;
const events_1 = require("events");
const client_sqs_1 = require("@aws-sdk/client-sqs");
class SQS extends events_1.EventEmitter {
    constructor(queueUrl, { logger, credentials, region, maxMessages = 10, pollingInterval = 5000 }) {
        super();
        this.logger = logger || console;
        this.queueUrl = queueUrl;
        this.pollingInterval = pollingInterval;
        this.isPolling = false;
        this.maxMessages = maxMessages;
        this.setCredentials({ region, credentials });
    }
    setCredentials({ region, credentials }) {
        this.client = new client_sqs_1.SQSClient({
            region: region || process.env.AWS_REGION,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
            },
        });
    }
    start() {
        if (!this.isPolling) {
            this.isPolling = true;
            this.pollMessages();
        }
    }
    stop() {
        this.isPolling = false;
    }
    async send(data) {
        try {
            const sendCommand = new client_sqs_1.SendMessageCommand({
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify(data),
            });
            await this.client.send(sendCommand);
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error}`);
            this.emit("error", error);
        }
    }
    async delete(receiptHandle) {
        try {
            const deleteCommand = new client_sqs_1.DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle,
            });
            await this.client.send(deleteCommand);
        }
        catch (error) {
            this.logger.error(`Error deleting message: ${error}`);
            this.emit("error", error);
        }
    }
    async pollMessages() {
        while (this.isPolling) {
            try {
                const receiveParams = {
                    QueueUrl: this.queueUrl,
                    MaxNumberOfMessages: this.maxMessages,
                    WaitTimeSeconds: 20,
                };
                const data = await this.client.send(new client_sqs_1.ReceiveMessageCommand(receiveParams));
                if (data.Messages) {
                    for (const message of data.Messages) {
                        this.emit("message", {
                            message: JSON.parse(message.Body),
                            resolve: () => this.delete(message.ReceiptHandle),
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error receiving messages: ${error}`);
                this.emit("error", error); // Emitindo evento de erro
            }
            await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
        }
    }
}
exports.SQS = SQS;
