# SQS Wrapper

A simple and event-driven wrapper library for AWS SQS, with message polling and error handling.

## Features

- **Event-driven**: Handles incoming SQS messages via events.
- **Polling**: Configurable polling interval to fetch messages from the queue.
- **Error Handling**: Emits errors as events, making it easy to track and handle errors in your application.

## Installation

```bash
npm install github:discovery-solutions/sqs-wrapper
```

## Usage

### Basic Setup

```typescript
import { SQS } from "sqs-wrapper";

const sqs = new SQS("your-queue-url", {
  credentials: {
    accessKeyId: "your-access-key-id",
    secretAccessKey: "your-secret-access-key",
  },
  maxMessages: 10, // optional, defaults to 10
  pollingInterval: 5000 // optional, defaults to 5000ms
});

// Event listener for incoming messages
sqs.on("message", ({ message, resolve }) => {
  console.log("Received message:", message);
  
  // Call `resolve()` to delete the message from the queue after processing
  resolve();
});

// Error handling
sqs.on("error", (error) => {
  console.error("Error:", error);
});

// Start polling for messages
sqs.start();

// Stop polling for messages
// sqs.stop();
```

### Sending a Message

```typescript
await sqs.send({ key: "value" });
```

### Deleting a Message

Messages are deleted automatically after you call `resolve()` on the `message` object within the `"message"` event handler. However, you can also delete messages manually if needed:

```typescript
const receiptHandle = "your-receipt-handle";
await sqs.delete(receiptHandle);
```

## Configuration Options

- **queueUrl** (string): URL of the SQS queue.
- **credentials** (object): AWS credentials (accessKeyId and secretAccessKey).
- **maxMessages** (number, optional): Maximum number of messages to fetch per polling cycle (default: 10).
- **pollingInterval** (number, optional): Interval (in milliseconds) between each polling cycle (default: 5000 ms).

## Events

- **message**: Emitted when a message is received. The event handler receives an object with:
  - **message**: Parsed JSON body of the message.
  - **resolve**: Function to delete the message after processing.
- **error**: Emitted when there is an error interacting with SQS.

## Example with Custom Logger

```typescript
const customLogger = {
  error: (msg: string) => console.error("Custom Error:", msg),
  log: (msg: string) => console.log("Custom Log:", msg),
};

const sqs = new SQS("your-queue-url", {
  credentials: {
    accessKeyId: "your-access-key-id",
    secretAccessKey: "your-secret-access-key",
  },
  logger: customLogger
});
```

## Development

### Building the Project

Run the following command to compile the TypeScript code:

```bash
npm run build
```

### Running Tests

Tests are set up with Jest. Run all tests with:

```bash
npm test
```

## License

This project is licensed under the MIT License.