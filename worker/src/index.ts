// Worker service — background job processor
import { WebhookEventProcessor } from './processors/webhookEventProcessor';

const webhookEventProcessor = new WebhookEventProcessor();

console.log('Worker service started');
console.log('Listening for jobs...');
console.log(`WebhookEventProcessor ready (${webhookEventProcessor.constructor.name})`);

// Keep the process alive
setInterval(() => {
  // Heartbeat
}, 30000);
