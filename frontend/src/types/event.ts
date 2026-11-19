// Shared event types for the frontend service
// Exercise 4: Your task is to add WebhookEvent type support here

export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: string;
}

// WebhookEvent extends BaseEvent and is defined in ./webhookEvent.ts.
