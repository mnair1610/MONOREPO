import { BaseEvent } from './event';

export type WebhookEventType =
  | 'payment.completed'
  | 'payment.failed'
  | 'refund.initiated';

export const DEFAULT_RETRY_COUNT = 0;

export interface WebhookEvent extends BaseEvent {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount: number;
}
