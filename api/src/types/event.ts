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

// TODO (Exercise 4): Add WebhookEvent type here
// WebhookEvent should extend BaseEvent with:
// - type: "payment.completed" | "payment.failed" | "refund.initiated"
// - payload: Record<string, unknown>
// - retryCount: number (default 0)
