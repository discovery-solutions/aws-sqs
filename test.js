const { SQS } = require('./dist');

const sqs = new SQS('test', {
  region: 'asd',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

sqs.start();