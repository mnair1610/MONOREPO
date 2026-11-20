// WebhookEvent — same shape as the API definition.
// retryCount defaults to 0 on first delivery.

export const WEBHOOK_EVENT_TYPES = [
  'payment.completed',
  'payment.failed',
  'refund.initiated',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export const DEFAULT_RETRY_COUNT = 0;

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount: number;
}

export function isWebhookEventType(type: string): type is WebhookEventType {
  return (WEBHOOK_EVENT_TYPES as readonly string[]).includes(type);
}
