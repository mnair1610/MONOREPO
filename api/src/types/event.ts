// Shared event types for the api service
// Exercise 4: Your task is to add WebhookEvent type support here

export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: string;
}

export interface PaymentEvent extends BaseEvent {
  type: 'payment.initiated';
  payload: {
    amount: number;
    currency: string;
    customerId: string;
  };
}

// WebhookEvent is defined in ./webhookEvent.ts
