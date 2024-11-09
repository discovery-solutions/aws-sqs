import { EventEmitter } from "events";
import {
  SQSClient,
  SendMessageCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
} from "@aws-sdk/client-sqs";

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

export class SQS extends EventEmitter {
  private logger: any;
  private queueUrl: string;
  private client: SQSClient;
  private pollingInterval: number;
  private isPolling: boolean;
  private maxMessages: number;

  constructor(
    queueUrl: string,
    { logger, credentials, region, maxMessages = 10, pollingInterval = 5000 }: SQSOptions,
  ) {
    super();
    
    this.logger = logger || console;
    this.queueUrl = queueUrl;
    this.pollingInterval = pollingInterval;
    this.isPolling = false;
    this.maxMessages = maxMessages;
    this.setCredentials({ region, credentials });
  }

  public setCredentials({ region, credentials }: { credentials: Credentials, region: string }): void {
    this.client = new SQSClient({
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

  async send(data: Record<string, any>) {
    try {
      const sendCommand = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(data),
      });

      await this.client.send(sendCommand);
    } catch (error) {
      this.logger.error(`Error sending message: ${error}`);
      this.emit("error", error);
    }
  }

  async delete(receiptHandle: string) {
    try {
      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.client.send(deleteCommand);
    } catch (error) {
      this.logger.error(`Error deleting message: ${error}`);
      this.emit("error", error);
    }
  }

  private async pollMessages() {
    while (this.isPolling) {
      try {
        const receiveParams: ReceiveMessageCommandInput = {
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: this.maxMessages,
          WaitTimeSeconds: 20,
        };

        const data = await this.client.send(new ReceiveMessageCommand(receiveParams));

        if (data.Messages) {
          for (const message of data.Messages) {
            this.emit("message", {
              message: JSON.parse(message.Body as string),
              resolve: () => this.delete(message.ReceiptHandle as string),
            });
          }
        }
      } catch (error) {
        this.logger.error(`Error receiving messages: ${error}`);
        this.emit("error", error); // Emitindo evento de erro
      }

      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    }
  }
}
