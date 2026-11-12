// Shared event types for the frontend service
// Exercise 4: Your task is to add WebhookEvent type support here

export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: string;
}

// TODO (Exercise 4): Add WebhookEvent type here (same definition as api/ and worker/)
// WebhookEvent should extend BaseEvent with:
// - type: "payment.completed" | "payment.failed" | "refund.initiated"
// - payload: Record<string, unknown>
// - retryCount: number (default 0)
